import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

type TwoFactorOTPProps = {
  username: string;
  otp: string;
};

const TwoFactorOTP = (props: TwoFactorOTPProps) => {
  const { username, otp } = props;
  return (
    <Html dir="ltr" lang="en">
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 py-[40px] font-sans">
          <Container className="mx-auto max-w-[600px] rounded-[8px] bg-white p-[32px]">
            <Section>
              <Text className="mt-0 mb-[16px] font-bold text-[24px] text-gray-900">
                Two-Factor Authentication Code
              </Text>

              <Text className="mt-0 mb-[24px] text-[16px] text-gray-700 leading-[24px]">
                Hi {username}, you requested a two-factor authentication code to
                sign in to your account.
              </Text>

              <Section className="mb-[32px] rounded-[6px] bg-gray-50 p-[24px] text-center">
                <Text className="m-0 font-mono text-[32px] font-bold text-gray-900 tracking-wider">
                  {otp}
                </Text>
              </Section>

              <Text className="mt-0 mb-[24px] text-[14px] text-gray-600 leading-[20px]">
                Enter this code in the verification page to complete your
                sign-in. This code will expire in 5 minutes.
              </Text>

              <Text className="mt-0 mb-[32px] text-[14px] text-gray-600 leading-[20px]">
                If you didn&apos;t request this code, please ignore this email
                or contact support if you have concerns about your account
                security.
              </Text>

              <Hr className="my-[24px] border-gray-200" />

              <Text className="m-0 text-[12px] text-gray-500 leading-[16px]">
                Best regards,
                <br />
                The Team
              </Text>
            </Section>

            <Section className="mt-[32px] border-gray-200 border-t pt-[24px]">
              <Text className="m-0 text-center text-[12px] text-gray-400 leading-[16px]">
                Company Name
                <br />
                123 Business Street, Suite 100
                <br />
                City, State 12345
              </Text>

              <Text className="m-0 mt-[8px] text-center text-[12px] text-gray-400 leading-[16px]">
                <a className="text-gray-400 underline" href="/">
                  Unsubscribe
                </a>{" "}
                | © 2024 Company Name. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default TwoFactorOTP;
