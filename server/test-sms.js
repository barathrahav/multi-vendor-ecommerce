import { sendOtpSms } from "./src/modules/auth/auth.service";

// Test script to verify Twilio SMS configuration
async function testTwilioSMS() {
  const testPhone = process.argv[2];

  if (!testPhone) {
    console.error("Usage: npm run test-sms <phone-number>");
    console.error("Example: npm run test-sms +1234567890");
    process.exit(1);
  }

  try {
    console.log("Testing Twilio SMS configuration...");
    console.log(`Sending test OTP to: ${testPhone}`);

    await sendOtpSms(testPhone, "123456");

    console.log("✅ SMS sent successfully!");
    console.log("Check your phone for the test OTP message.");
  } catch (error) {
    console.error("❌ SMS test failed:");
    console.error(error.message);

    console.log("\n🔧 Troubleshooting tips:");
    console.log("1. Verify your Twilio Account SID and Auth Token");
    console.log("2. Ensure the FROM phone number is verified/purchased in Twilio");
    console.log("3. Check that your Twilio account has SMS capabilities");
    console.log("4. Make sure the phone number is in E.164 format (+countrycode)");
    console.log("5. Verify your account has sufficient balance");

    process.exit(1);
  }
}

testTwilioSMS();