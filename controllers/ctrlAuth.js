import { ctrlWrapper } from "../decorators/index.js";
import { HttpError, sendEmail } from "../helpers/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import gravatar from "gravatar";
import Jimp from "jimp";
import { nanoid } from "nanoid";

const { SECRET_KEY, BASE_URL } = process.env;

const signup = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const verificationCode = nanoid();

  const avatarURL = gravatar.url(email);
  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationCode,
  });

  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${verificationCode}">Click to verify email</a>`,
  };
  await sendEmail(verifyEmail);

  res.status(201).json({
    username: newUser.username,
    email: newUser.email,
    avatarURL,
  });
};

const verify = async (req, res) => {
  const { verificationCode } = req.params;
  const user = await User.findOne({ verificationCode });
  if (!user) {
    throw HttpError(404);
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verificationCode: "",
  });

  res.json({
    message: "Email verify success",
  });
};

const resendEmail = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(404, "Email not found");
  }
  if (user.verify) {
    throw HttpError(400, "Email already verify");
  }
  const verifyEmail = {
    to: email,
    subject: "Verify email",
    html: `<a target="_blank" href="${BASE_URL}/api/auth/verify/${user.verificationCode}">Click to verify email</a>`,
  };
  await sendEmail(verifyEmail);

  res.json({
    message: "Verify email resend success",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }
  if (!user.verify) {
    throw HttpError(401, "Email not verify"); // throw HttpError(401, "Email or password invalid");
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw HttpError(401, "Email or password is wrong");
  }

  const payload = {
    id: user._id,
  };
  const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "30m" });
  const refreshToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "10d" });
  await User.findByIdAndUpdate(id, { accessToken, refreshToken });
  res.json({ accessToken, refreshToken });
};

const getCurrent = (req, res) => {
  const { name, email } = req.user;
  res.json({ name, email });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { accessToken: "", refreshToken: "" });

  res.json({ message: "Signout success" });
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const { id } = jwt.verify(refreshToken, SECRET_KEY);
    const user = await User.findByIdAndUpdate({ refreshToken });
    if (!user) {
      throw HttpError(403);
    }
    const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "30m" });
    const refreshToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "10d" });
    await User.findByIdAndUpdate(id, { accessToken, refreshToken });
    res.json({ accessToken, refreshToken });
  } catch (error) {
    throw HttpError(403);
  }
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const filename = `${Date.now()}-${originalname}`;
  const resultUpload = path.join(avatarDir, filename);

  const img = await Jimp.read(tempUpload);
  await resizeFile.resize(250, 250).write(resultUpload);

  await fs.rename(tempUpload, resultUpload);
  const avatarURL = path.join("avatars", filename);
  await User.findByIdAndUpdate(_id, { avatarURL });
  res.status(200).json({ avatarURL });
};

export default {
  signup: ctrlWrapper(signup),
  verify: ctrlWrapper(verify),
  resendEmail: ctrlWrapper(resendEmail),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  getCurrent: ctrlWrapper(getCurrent),
  refresh: ctrlWrapper(refresh),
  updateAvatar: ctrlWrapper(updateAvatar),
};
