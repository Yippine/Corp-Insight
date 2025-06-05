import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { Buffer } from 'buffer'; // Needed for file buffer
import { logFeedbackSubmission } from '@/lib/mongodbUtils'; // 導入

interface VerificationTokenPayload {
  email: string;
  code: string;
  iat: number;
  exp: number;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const type = formData.get('type') as string;
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const email = formData.get('email') as string;
    const verificationCode = formData.get('verificationCode') as string;
    const tokenFromClient = formData.get('verificationToken') as string;
    const file = formData.get('file') as File | null;

    // --- 1. Validate required fields ---
    if (
      !type ||
      !title ||
      !content ||
      !email ||
      !verificationCode ||
      !tokenFromClient
    ) {
      return NextResponse.json({ message: '缺少必要欄位' }, { status: 400 });
    }

    // --- 2. Verify JWT and the code ---
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET 未設定');
      return NextResponse.json(
        { message: '伺服器內部錯誤：JWT 配置不當' },
        { status: 500 }
      );
    }

    let decodedToken: VerificationTokenPayload;
    try {
      decodedToken = jwt.verify(
        tokenFromClient,
        jwtSecret
      ) as VerificationTokenPayload;
    } catch (error) {
      console.error('JWT 驗證失敗:', error);
      if (error instanceof jwt.TokenExpiredError) {
        return NextResponse.json(
          { message: '驗證碼已過期，請重新發送' },
          { status: 401 }
        );
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return NextResponse.json({ message: '驗證權杖無效' }, { status: 401 });
      }
      return NextResponse.json(
        { message: '驗證失敗，請重試' },
        { status: 401 }
      );
    }

    if (decodedToken.email !== email) {
      return NextResponse.json(
        { message: '電子郵件與驗證權杖不符' },
        { status: 401 }
      );
    }
    if (decodedToken.code !== verificationCode) {
      return NextResponse.json({ message: '驗證碼錯誤' }, { status: 401 });
    }

    // --- 3. Prepare email transporter (same as in send-code) ---
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '465', 10),
      secure: parseInt(process.env.EMAIL_SERVER_PORT || '465', 10) === 465,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
      // 僅供測試環境時使用，正式環境不得使用
      ...(process.env.NODE_ENV === 'development' && {
        tls: {
          rejectUnauthorized: false,
        },
      }),
    });

    // --- 4. Handle file attachment ---
    const attachmentsArray: nodemailer.SendMailOptions['attachments'] = [];
    if (file && file.size > 0) {
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      attachmentsArray.push({
        filename: file.name,
        content: fileBuffer,
        contentType: file.type,
      });
    }

    // --- 5. Send feedback email to developer ---
    const developerEmail = process.env.NEXT_PUBLIC_DEVELOPER_EMAIL;
    if (!developerEmail) {
      console.error('NEXT_PUBLIC_DEVELOPER_EMAIL 未設定');
      // Decide if this should be a fatal error for the user or just logged
      return NextResponse.json(
        { message: '伺服器內部錯誤：開發者郵箱未配置' },
        { status: 500 }
      );
    }

    const feedbackMailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Business Magnifier 反饋系統'}" <${process.env.EMAIL_FROM}>`,
      to: developerEmail,
      subject: `📬 新意見回饋（#${Date.now().toString().slice(-6)}）—${type}：${title}`,
      html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 700px; margin: 20px auto; padding: 25px; border: 1px solid #ccc; border-radius: 10px; background-color: #ffffff; box-shadow: 0 4px 8px rgba(0,0,0,0.05);">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #0056b3;">
          <h1 style="color: #0056b3; font-size: 26px; margin: 0;">📥 新的意見回饋</h1>
        </div>
        <div style="padding: 20px 5px;">
          <h2 style="color: #333; font-size: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-top: 0;">回饋詳情（ID：#${Date.now().toString().slice(-6)}）</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 15px;">
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold; color: #495057; width: 120px;">來自（Email）</td>
              <td style="padding: 10px; border: 1px solid #dee2e6;"><a href="mailto:${email}" style="color: #0056b3; text-decoration: none;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold; color: #495057;">回饋類型</td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">${type}</td>
            </tr>
            <tr style="background-color: #f8f9fa;">
              <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold; color: #495057;">問題概要</td>
              <td style="padding: 10px; border: 1px solid #dee2e6;">${title}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold; color: #495057; vertical-align: top;">詳細說明</td>
              <td style="padding: 10px; border: 1px solid #dee2e6; white-space: pre-wrap; word-wrap: break-word;">${content.replace(/\n/g, '<br>')}</td>
            </tr>
            ${
              attachmentsArray.length > 0
                ? `<tr style="background-color: #f8f9fa;">
                <td style="padding: 10px; border: 1px solid #dee2e6; font-weight: bold; color: #495057;">附加檔案</td>
                <td style="padding: 10px; border: 1px solid #dee2e6;">${attachmentsArray.map(att => att.filename).join(', ')}</td>
              </tr>`
                : ''
            }
          </table>
        </div>
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
          <p>此郵件由 Business Magnifier 意見回饋系統自動產生。</p>
        </div>
      </div>
      `,
      attachments: attachmentsArray,
    };

    try {
      await transporter.sendMail(feedbackMailOptions);
      console.log('Feedback email sent to developer:', developerEmail);
    } catch (error) {
      console.error('Error sending feedback email to developer:', error);
      // Log this error but don't necessarily fail the whole request yet,
      // as sending confirmation to user is also important.
      // However, if this fails, the primary goal is missed.
      return NextResponse.json(
        { message: '提交回饋時發送給開發者郵件失敗' },
        { status: 500 }
      );
    }

    // --- 6. Send confirmation email to user ---
    const userConfirmationMailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Business Magnifier 客戶支援'}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `我們已收到您的 Business Magnifier 意見回饋（#${Date.now().toString().slice(-6)}）`,
      html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee;">
          <h1 style="color: #0056b3; font-size: 28px; margin: 0;">Business Magnifier</h1>
        </div>
        <div style="padding: 20px 0;">
          <p style="font-size: 18px; color: #28a745; font-weight: bold;">感謝您的意見！</p>
          <p style="font-size: 16px; color: #333;">您好 ${email.split('@')[0]}，</p>
          <p style="font-size: 16px; color: #333;">我們已成功收到您提交的意見回饋（ID：#${Date.now().toString().slice(-6)}）。以下是您提交的摘要：</p>
          
          <div style="margin-top: 20px; padding: 15px; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 6px;">
            <p style="font-size: 15px; color: #333; margin: 5px 0;"><strong>回饋類型：</strong> ${type}</p>
            <p style="font-size: 15px; color: #333; margin: 5px 0;"><strong>問題概要：</strong> ${title}</p>
            <p style="font-size: 15px; color: #333; margin: 5px 0; white-space: pre-wrap; word-wrap: break-word;"><strong>詳細說明：</strong> ${content.replace(/\n/g, '<br>')}</p>
            ${file ? `<p style="font-size: 15px; color: #333; margin: 5px 0;"><strong>附加檔案：</strong> ${file.name}</p>` : ''}
          </div>

          <p style="font-size: 16px; color: #333; margin-top: 20px;">我們會儘快處理您的回饋，並在需要時與您聯繫。</p>
          <p style="font-size: 16px; color: #333;">再次感謝您的支持與寶貴意見！</p>
        </div>
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
          <p>此郵件為系統自動發送，請勿直接回覆。</p>
          <p>若有任何疑問，歡迎隨時訪問我們的網站或透過其他方式聯繫我們。</p>
          <p>&copy; ${new Date().getFullYear()} Business Magnifier. All rights reserved.</p>
        </div>
      </div>
      `,
    };

    try {
      await transporter.sendMail(userConfirmationMailOptions);
      console.log('Confirmation email sent to user:', email);
    } catch (error) {
      console.error('Error sending confirmation email to user:', error);
      // Log this error. Even if this fails, the feedback was sent to the developer.
      // You might want to inform the user that confirmation couldn't be sent but feedback was received.
    }

    // Log the feedback submission to MongoDB before returning success to user
    const submissionDataForLog = {
      type,
      title,
      content,
      email,
      fileName: file ? file.name : null,
      fileSize: file ? file.size : null,
      fileType: file ? file.type : null,
      developer_email_sent: true, // Assuming it was successful if we reached here
      user_confirmation_email_sent: true, // Assuming successful or logging error above
    };
    await logFeedbackSubmission(submissionDataForLog);

    return NextResponse.json(
      { message: '您的意見回饋已成功提交！感謝您的寶貴意見。' },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/feedback/submit error:', error);
    // Check if it's a known error type, e.g., from formData parsing
    if (
      error instanceof TypeError &&
      error.message.includes('Failed to parse')
    ) {
      return NextResponse.json(
        { message: '提交的表單資料格式錯誤' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: '提交回饋時發生未知錯誤' },
      { status: 500 }
    );
  }
}
