
import { FileItem, FileType, User, PermissionLevel } from './types';

export const MOCK_USERS: User[] = [
  { id: 'user_123', name: 'Alex Doe', email: 'alex.doe@example.com', avatarUrl: 'https://picsum.photos/id/237/200/200' },
  { id: 'user_456', name: 'Jane Smith', email: 'jane.smith@example.com', avatarUrl: 'https://picsum.photos/id/238/200/200' },
  { id: 'user_789', name: 'Sam Wilson', email: 'sam.wilson@example.com', avatarUrl: 'https://picsum.photos/id/239/200/200' },
];

export const MOCK_FILES: FileItem[] = [
  {
    id: '1',
    name: 'Project Proposal.docx',
    type: FileType.DOCX,
    size: 204857,
    lastModified: new Date('2023-10-26T10:00:00Z'),
    owner: 'user_123',
    s3Key: 'uploads/user_123/1629876543210-Project_Proposal.docx',
    sharingInfo: {
      isPublic: false,
      publicLink: 'https://nanocloud.dev/share/a1b2c3d4',
      collaborators: [
        { user: MOCK_USERS[1], permission: PermissionLevel.EDIT },
        { user: MOCK_USERS[2], permission: PermissionLevel.VIEW },
      ]
    }
  },
  {
    id: '2',
    name: 'Q3 Financials.pdf',
    type: FileType.PDF,
    size: 1024321,
    lastModified: new Date('2023-10-25T14:30:00Z'),
    owner: 'user_123',
    s3Key: 'uploads/user_123/1629876543211-Q3_Financials.pdf',
    sharingInfo: {
      isPublic: true,
      publicLink: 'https://nanocloud.dev/share/e5f6g7h8',
      collaborators: []
    }
  },
  {
    id: '3',
    name: 'Website Mockup.png',
    type: FileType.PNG,
    size: 512123,
    lastModified: new Date('2023-10-25T09:15:00Z'),
    owner: 'user_123',
    s3Key: 'uploads/user_123/1629876543212-Website_Mockup.png',
    sharingInfo: {
      isPublic: false,
      publicLink: 'https://nanocloud.dev/share/i9j0k1l2',
      collaborators: [
        { user: MOCK_USERS[1], permission: PermissionLevel.VIEW },
      ]
    }
  },
  {
    id: '4',
    name: 'User Feedback Notes.txt',
    type: FileType.TXT,
    size: 5120,
    lastModified: new Date('2023-10-24T18:45:00Z'),
    owner: 'user_123',
    s3Key: 'uploads/user_123/1629876543213-User_Feedback_Notes.txt',
    sharingInfo: {
      isPublic: false,
      publicLink: 'https://nanocloud.dev/share/m3n4o5p6',
      collaborators: []
    }
  },
  {
    id: '5',
    name: 'Team Offsite Photos',
    type: FileType.FOLDER,
    size: 0,
    lastModified: new Date('2023-10-23T11:00:00Z'),
    owner: 'user_123',
    s3Key: ''
  },
  {
    id: '6',
    name: 'Onboarding Guide.pdf',
    type: FileType.PDF,
    size: 850432,
    lastModified: new Date('2023-10-22T16:20:00Z'),
    owner: 'user_123',
    s3Key: 'uploads/user_123/1629876543215-Onboarding_Guide.pdf',
    sharingInfo: {
      isPublic: false,
      publicLink: 'https://nanocloud.dev/share/q7r8s9t0',
      collaborators: []
    }
  },
];
