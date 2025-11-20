
export enum FileType {
  PDF = 'application/pdf',
  PNG = 'image/png',
  JPG = 'image/jpeg',
  DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  TXT = 'text/plain',
  FOLDER = 'folder',
}

export enum PermissionLevel {
  VIEW = 'Can view',
  EDIT = 'Can edit',
}

export interface Collaborator {
  user: User;
  permission: PermissionLevel;
}

export interface SharingInfo {
  isPublic: boolean;
  publicLink: string;
  collaborators: Collaborator[];
}

export interface FileItem {
  id: string;
  name: string;
  type: FileType;
  size: number; // in bytes
  lastModified: Date;
  owner: string;
  s3Key: string;
  sharingInfo?: SharingInfo;
}

export interface User {
  id: string;
  name: string;
  avatarUrl: string;
  email: string;
}

export enum NavSection {
  RECENT = 'Recent Files',
  STARRED = 'Starred',
  BROWSE = 'Browse',
  TRASH = 'Trash Bin',
}
