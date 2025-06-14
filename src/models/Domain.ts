import mongoose, { Schema, models, model, Document } from 'mongoose';

export interface Scenario {
  _id: mongoose.Types.ObjectId;
  description: string;
  createdAt: Date;
  status: 'pending' | 'done';
  result?: any;
}

export interface Group {
  _id: mongoose.Types.ObjectId;
  groupName: string;
  createdAt: Date;
  scenarios: Scenario[];
}

export interface DomainDoc extends Document {
  name: string;
  createdAt: Date;
  groups: Group[];
}

const ScenarioSchema = new Schema<Scenario>({
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'done'], default: 'pending' },
  result: { type: Schema.Types.Mixed },
}, { _id: true });

const GroupSchema = new Schema<Group>({
  groupName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  scenarios: { type: [ScenarioSchema], default: [] },
}, { _id: true });

const DomainSchema = new Schema<DomainDoc>({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  groups: { type: [GroupSchema], default: [] },
});

export const Domain = models.Domain || model<DomainDoc>('Domain', DomainSchema);
