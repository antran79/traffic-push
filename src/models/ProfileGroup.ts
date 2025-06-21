import mongoose, { Schema, models, model, Document } from 'mongoose';

export interface Profile {
  _id: mongoose.Types.ObjectId;
  name: string;
  userAgent: string;
  languages: string[];
  timezone: string;
  latitude: number;
  longitude: number;
  geoAccuracy: number;
  width: number;
  height: number;
  deviceScaleFactor?: number;
  isMobile?: boolean;
  hasTouch?: boolean;
  proxy?: string;
  createdAt: Date;
  browser?: string;
  os?: string;
  // ... các trường fingerprint khác nếu cần
}

export interface ProfileGroupDoc extends Document {
  name: string;
  createdAt: Date;
  profiles: Profile[];
}

const ProfileSchema = new Schema<Profile>({
  name: { type: String, required: true },
  userAgent: { type: String, required: true },
  languages: [{ type: String }],
  timezone: String,
  latitude: Number,
  longitude: Number,
  geoAccuracy: Number,
  width: Number,
  height: Number,
  deviceScaleFactor: Number,
  isMobile: Boolean,
  hasTouch: Boolean,
  proxy: String,
  browser: String,
  os: String,
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const ProfileGroupSchema = new Schema<ProfileGroupDoc>({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  profiles: { type: [ProfileSchema], default: [] }
});

export const ProfileGroup = models.ProfileGroup || model<ProfileGroupDoc>("ProfileGroup", ProfileGroupSchema);

export default ProfileGroup;
