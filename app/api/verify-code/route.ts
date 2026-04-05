import dbConnect from "@/app/lib/dbConnect";
import UserModel from "@/app/model/user";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, code } = await request.json();
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 },
      );
    }
    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      await user.save();
      return Response.json(
        {
          success: true,
          message: "Account Verified Successfully",
        },
        { status: 200 },
      );
    } else if (!isCodeNotExpired) {
      return Response.json(
        {
          success: false,
          message:
            "Verification Code Has been Expired, Please Sign Up again to get the code",
        },
        { status: 400 },
      );
    } else {
      return Response.json({
        success: false,
        message: "Verification Code is Wrong",
      });
    }
  } catch (error) {
    console.error("Error verifying username", error);
    return Response.json(
      {
        success: false,
        message: "Error verifying username",
      },
      {
        status: 500,
      },
    );
  }
}
