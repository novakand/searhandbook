export interface ITripAdvisorRating {
  folderId?: number;
  folder?: IFolder;
  fileName?: string;
  fileHash?: string;
  fileSize?: number;
  fileUrl?: string;
  fileStorageId?: number;
  createDate?: string;
  createUserName?: string;
  updateDate?: string;
  updateUserName?: string;
  entityState?: number;
  name?: string;
  description?: string;
  id?: number;
  isTransient?: boolean;
  isEntityModified?: boolean;
}

export interface IFolder {
  code?: string;
  id?: number;
  isTransient?: boolean;
  isEntityModified?: boolean;
}
