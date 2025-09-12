const {onDocumentUpdated} = require("firebase-functions/v2/firestore");
const {onCall} = require("firebase-functions/v2/https");
const {initializeApp} = require("firebase-admin/app");
const {getFirestore} = require("firebase-admin/firestore");
const {getStorage} = require("firebase-admin/storage");
const nodemailer = require("nodemailer");
const functions = require("firebase-functions");

// Initialize Firebase Admin
initializeApp();

const db = getFirestore();
const storage = getStorage();

// Email configuration
const getEmailConfig = () => {
  try {
    const config = functions.config();
    return {
      user: config.email?.user || 'yannathirdwed@gmail.com',
      pass: config.email?.password || 'rnlj ioui kobg lvts'
    };
  } catch (error) {
    console.warn('Using fallback email config:', error.message);
    return {
      user: 'yannathirdwed@gmail.com',
      pass: 'rnlj ioui kobg lvts'
    };
  }
};

const emailConfig = getEmailConfig();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: emailConfig,
});

/**
 * Cloud Function triggered when a guest RSVP is created or updated
 * Sends email invitation when guest is_coming is set to true
 */
exports.sendRSVPEmail = onDocumentUpdated("guests/{guestId}", async (event) => {
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();

  // Only send email if:
  // 1. Guest just confirmed they're coming (is_coming changed from null/false to true)
  // 2. Guest has an email address
  // 3. Email hasn't been sent already
  if (
    afterData.is_coming === true &&
    beforeData.is_coming !== true &&
    afterData.email &&
    !afterData.invitation_email_sent
  ) {
    try {
      console.log(`Sending invitation email to ${afterData.name} (${afterData.email})`);

      // Get invitation image from storage
      const bucket = storage.bucket();
      const invitationFile = bucket.file("invitation.png");
      
      let invitationAttachment = null;
      try {
        const [exists] = await invitationFile.exists();
        if (exists) {
          const [buffer] = await invitationFile.download();
          invitationAttachment = {
            filename: "invitation.png",
            content: buffer,
            cid: "invitation", // Content-ID for embedding in HTML
          };
        }
      } catch (storageError) {
        console.warn("Could not load invitation image from storage:", storageError.message);
      }

      // Create email content
      const htmlContent = createEmailTemplate(afterData, invitationAttachment ? true : false);

      const mailOptions = {
        from: emailConfig.user,
        to: afterData.email,
        subject: "🎉 You're Invited to Third & Aleanna's Wedding!",
        html: htmlContent,
        attachments: invitationAttachment ? [invitationAttachment] : [],
      };

      // Send email
      await transporter.sendMail(mailOptions);

      // Mark email as sent in Firestore
      await event.data.after.ref.update({
        invitation_email_sent: true,
        invitation_email_sent_at: new Date().toISOString(),
      });

      console.log(`✅ Email sent successfully to ${afterData.email}`);
    } catch (error) {
      console.error("❌ Error sending email:", error);
      
      // Log error in Firestore for monitoring
      await event.data.after.ref.update({
        invitation_email_error: error.message,
        invitation_email_error_at: new Date().toISOString(),
      });
    }
  }
});

/**
 * Manual function to send invitation to a specific guest
 * Can be called from admin panel
 */
exports.sendManualInvitation = onCall(async (request) => {
  const {guestId} = request.data;
  
  if (!guestId) {
    throw new functions.https.HttpsError("invalid-argument", "Guest ID is required");
  }

  try {
    const guestDoc = await db.collection("guests").doc(guestId).get();
    
    if (!guestDoc.exists) {
      throw new functions.https.HttpsError("not-found", "Guest not found");
    }

    const guestData = guestDoc.data();
    
    if (!guestData.email) {
      throw new functions.https.HttpsError("invalid-argument", "Guest has no email address");
    }

    // Get invitation image from storage
    const bucket = storage.bucket();
    const invitationFile = bucket.file("invitation.png");
    
    let invitationAttachment = null;
    try {
      const [exists] = await invitationFile.exists();
      if (exists) {
        const [buffer] = await invitationFile.download();
        invitationAttachment = {
          filename: "invitation.png",
          content: buffer,
          cid: "invitation",
        };
      }
    } catch (storageError) {
      console.warn("Could not load invitation image from storage:", storageError.message);
    }

    // Create email content
    const htmlContent = createEmailTemplate(guestData, invitationAttachment ? true : false);

    const mailOptions = {
      from: emailConfig.user,
      to: guestData.email,
      subject: "🎉 You're Invited to Third & Aleanna's Wedding!",
      html: htmlContent,
      attachments: invitationAttachment ? [invitationAttachment] : [],
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Update guest record
    await guestDoc.ref.update({
      invitation_email_sent: true,
      invitation_email_sent_at: new Date().toISOString(),
      manual_invitation_sent: true,
    });

    return {success: true, message: `Invitation sent to ${guestData.email}`};
  } catch (error) {
    console.error("Error sending manual invitation:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

/**
 * Function to send bulk invitations to all confirmed guests
 */
exports.sendBulkInvitations = onCall(async () => {
  try {
    const guestsSnapshot = await db.collection("guests")
      .where("is_coming", "==", true)
      .where("invitation_email_sent", "!=", true)
      .get();

    const results = [];
    
    for (const doc of guestsSnapshot.docs) {
      const guestData = doc.data();
      
      if (!guestData.email) {
        results.push({
          guestId: doc.id,
          name: guestData.name,
          status: "skipped",
          reason: "No email address",
        });
        continue;
      }

      try {
        // Get invitation image from storage
        const bucket = storage.bucket();
        const invitationFile = bucket.file("invitation.png");
        
        let invitationAttachment = null;
        try {
          const [exists] = await invitationFile.exists();
          if (exists) {
            const [buffer] = await invitationFile.download();
            invitationAttachment = {
              filename: "invitation.png",
              content: buffer,
              cid: "invitation",
            };
          }
        } catch (storageError) {
          console.warn("Could not load invitation image:", storageError.message);
        }

        const htmlContent = createEmailTemplate(guestData, invitationAttachment ? true : false);

        const mailOptions = {
          from: emailConfig.user,
          to: guestData.email,
          subject: "🎉 You're Invited to Third & Aleanna's Wedding!",
          html: htmlContent,
          attachments: invitationAttachment ? [invitationAttachment] : [],
        };

        await transporter.sendMail(mailOptions);

        await doc.ref.update({
          invitation_email_sent: true,
          invitation_email_sent_at: new Date().toISOString(),
          bulk_invitation_sent: true,
        });

        results.push({
          guestId: doc.id,
          name: guestData.name,
          email: guestData.email,
          status: "sent",
        });

        // Add delay between emails to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error sending email to ${guestData.email}:`, error);
        
        await doc.ref.update({
          invitation_email_error: error.message,
          invitation_email_error_at: new Date().toISOString(),
        });

        results.push({
          guestId: doc.id,
          name: guestData.name,
          email: guestData.email,
          status: "error",
          error: error.message,
        });
      }
    }

    return {
      success: true,
      totalProcessed: results.length,
      results: results,
    };
  } catch (error) {
    console.error("Error in bulk invitation send:", error);
    throw new functions.https.HttpsError("internal", error.message);
  }
});

/**
 * Create HTML email template
 */
function createEmailTemplate(guestData, hasInvitationImage) {
  const invitationImageHtml = hasInvitationImage
    ? `<img src="cid:invitation" alt="Wedding Invitation" style="max-width: 100%; height: auto; border-radius: 10px; margin: 20px 0;" />`
    : `<div style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 40px; border-radius: 10px; margin: 20px 0; text-align: center;">
         <h3 style="color: #333; margin: 0;">Wedding Invitation</h3>
         <p style="color: #666; margin: 10px 0 0 0;">Image will be available soon</p>
       </div>`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Wedding Invitation - Third & Aleanna</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Arial', sans-serif; background-color: #f8f9fa;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <!-- Header -->
        <div style="background: #8d5b4c; color: #f9f1e7; padding: 40px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 300;">You're Invited!</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">To celebrate the wedding of</p>
        </div>

        <!-- Main Content -->
        <div style="padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="margin: 0; font-size: 32px; color: #2c1810; font-weight: 400;">Third & Aleanna</h2>
            <p style="margin: 10px 0; font-size: 18px; color: #8d5b4c;">October 11, 2025</p>
          </div>

          <!-- Personalized Greeting -->
          <div style="margin-bottom: 30px;">
            <p style="font-size: 16px; color: #2c1810; line-height: 1.6;">
              Dear ${guestData.name},
            </p>
            <p style="font-size: 16px; color: #2c1810; line-height: 1.6;">
              We are delighted to invite you to celebrate our special day with us! Your presence would mean the world to us as we begin this new chapter of our lives together.
            </p>
          </div>

          <!-- Invitation Image -->
          ${invitationImageHtml}

          <!-- Event Details -->
          <div style="background-color: #f9f1e7; padding: 30px; border-radius: 10px; margin: 30px 0;">
            <h3 style="margin: 0 0 20px 0; color: #2c1810; text-align: center;">Wedding Details</h3>
            
            <div style="margin-bottom: 20px;">
              <h4 style="margin: 0 0 5px 0; color: #8d5b4c; font-size: 16px;">📅 Date & Time</h4>
              <p style="margin: 0; color: #2c1810;">Saturday, October 11, 2025 at 2:00 PM</p>
            </div>

            <div style="margin-bottom: 20px;">
              <h4 style="margin: 0 0 5px 0; color: #8d5b4c; font-size: 16px;">⛪ Ceremony</h4>
              <p style="margin: 0; color: #2c1810;">SAN JUAN DELA CRUZ PARISH<br>Ugong, Valenzuela City</p>
            </div>

            <div>
              <h4 style="margin: 0 0 5px 0; color: #8d5b4c; font-size: 16px;">🎉 Reception</h4>
              <p style="margin: 0; color: #2c1810;">Patio Queen Sofia<br>21 F. de la Cruz, Valenzuela, Metro Manila<br>4:30 PM</p>
            </div>
          </div>

          <!-- RSVP Information -->
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 16px; color: #2c1810; margin-bottom: 20px;">
              Thank you for confirming your attendance! We can't wait to celebrate with you.
            </p>
            
            <div style="background: #d4b08c; color: #2c1810; padding: 20px; border-radius: 10px;">
              <h4 style="margin: 0 0 10px 0;">RSVP Status: Confirmed ✅</h4>
              <p style="margin: 0; font-size: 14px; opacity: 0.9;">
                ${guestData.guest_type === 'bride' ? "Friend of the Bride" : "Friend of the Groom"}
                ${guestData.group_info ? ` • ${guestData.group_info.group_name}` : ""}
              </p>
            </div>
          </div>

          <!-- Website & Contact Information -->
          <div style="background-color: #f9f1e7; padding: 20px; border-radius: 10px; margin: 30px 0;">
            <h4 style="margin: 0 0 15px 0; color: #2c1810; text-align: center;">Visit Our Wedding Website</h4>
            <p style="margin: 0 0 15px 0; text-align: center; color: #8d5b4c; font-size: 16px;">
              <a href="https://thirdandaleanna.website" style="color: #8d5b4c; text-decoration: none; font-weight: 500;">
                thirdandaleanna.website
              </a>
            </p>
            <p style="margin: 0; text-align: center; color: #2c1810; font-size: 14px;">
              If you have any questions, please don't hesitate to reach out to us.
            </p>
          </div>

          <!-- Closing -->
          <div style="text-align: center; margin: 30px 0;">
            <p style="font-size: 16px; color: #2c1810; font-style: italic;">
              With love and excitement,
            </p>
            <p style="font-size: 18px; color: #8d5b4c; font-weight: 500; margin: 10px 0;">
              Third & Aleanna
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div style="background-color: #2c1810; color: #f9f1e7; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">
            This invitation was sent because you RSVP'd "Yes" to our wedding.
          </p>
          <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.6;">
            Third & Aleanna's Wedding • October 11, 2025 • Valenzuela City, Philippines
          </p>
        </div>

      </div>
    </body>
    </html>
  `;
}
