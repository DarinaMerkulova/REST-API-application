import { ctrlWrapper } from "../decorators/index.js";
import { HttpError } from "../helpers/index.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import gravatar from "gravatar";
import Jimp from 'jimp';

const { SECRET_KEY } = process.env;

const signup = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    throw HttpError(409, "Email in use");
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email)
  const newUser = await User.create({ ...req.body, password: hashPassword, avatarURL });
  res.status(201).json({
    username: newUser.username,
    email: newUser.email,
    avatarURL
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(401, "Email or password is wrong");
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
  await resizeFile.resize(250, 250).write(resultUpload)
  
  await fs.rename(tempUpload, resultUpload);
  const avatarURL = path.join('avatars', filename);
  await User.findByIdAndUpdate(_id, { avatarURL });
  res.status(200).json({ avatarURL });
};

export default {
  signup: ctrlWrapper(signup),
  login: ctrlWrapper(login),
  logout: ctrlWrapper(logout),
  getCurrent: ctrlWrapper(getCurrent),
  refresh: ctrlWrapper(refresh),
  updateAvatar: ctrlWrapper(updateAvatar),
};
