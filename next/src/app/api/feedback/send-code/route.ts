import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

// Helper function to generate a random 6-digit code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: '缺少電子郵件地址' }, { status: 400 });
    }

    // Basic email validation (consider a more robust library for production)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: '無效的電子郵件格式' }, { status: 400 });
    }

    const verificationCode = generateVerificationCode();
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error('JWT_SECRET 未設定');
      return NextResponse.json({ message: '伺服器內部錯誤：JWT 配置不當' }, { status: 500 });
    }

    // Create a JWT containing the email and verification code
    // The token will expire in 10 minutes
    const token = jwt.sign(
      { email, code: verificationCode }, 
      jwtSecret, 
      { expiresIn: '10m' } // 10 minutes
    );

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: parseInt(process.env.EMAIL_SERVER_PORT || '465', 10),
      secure: parseInt(process.env.EMAIL_SERVER_PORT || '465', 10) === 465, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
      // 僅供測試環境時使用，正式環境不得使用
      ...(process.env.NODE_ENV === 'development' && {
        tls: {
          rejectUnauthorized: false
        }
      })
    });

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'Business Magnifier 客戶支援'}" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: '您的 Business Magnifier 意見回饋系統驗證碼',
      html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eee;">
          <h1 style="color: #0056b3; font-size: 28px; margin: 0;">Business Magnifier</h1>
          <p style="color: #555; font-size: 14px; margin-top: 5px;">意見回饋驗證</p>
        </div>
        <div style="padding: 20px 0;">
          <p style="font-size: 16px; color: #333;">您好，</p>
          <p style="font-size: 16px; color: #333;">感謝您使用我們的意見回饋系統。您的驗證碼是：</p>
          <p style="font-size: 32px; font-weight: bold; color: #0056b3; text-align: center; margin: 20px 0; letter-spacing: 2px; background-color: #e7f0f7; padding: 10px; border-radius: 4px;">${verificationCode}</p>
          <p style="font-size: 16px; color: #333;">此驗證碼將在 <strong>10 分鐘</strong>內過期。</p>
          <p style="font-size: 16px; color: #333;">如果您沒有請求此驗證碼，請忽略此郵件。</p>
        </div>
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #888;">
          <p>此郵件為系統自動發送，請勿直接回覆。</p>
          <p>&copy; ${new Date().getFullYear()} Business Magnifier. All rights reserved.</p>
        </div>
      </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Verification email sent to:', email);
      return NextResponse.json({ 
        message: '驗證碼已成功發送至您的電子郵件。請檢查您的收件匣。' , 
        verificationToken: token // Return the JWT to the client
      }, { status: 200 });
    } catch (error) {
      console.error('Error sending email:', error);
      // Check for specific Nodemailer errors if needed
      if (error instanceof Error && error.message.includes('Invalid login')) {
        return NextResponse.json({ message: '郵件伺服器認證失敗，請檢查管理員配置。' }, { status: 500 });
      }
      return NextResponse.json({ message: '驗證碼郵件發送失敗，請稍後再試。' }, { status: 500 });
    }

  } catch (error) {
    console.error('POST /api/feedback/send-code error:', error);
    return NextResponse.json({ message: '處理請求時發生錯誤' }, { status: 500 });
  }
}