/** 文件类型枚举 */
export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  OTHER = 'other',
}

/** 文件上传响应 */
export interface FileUploadResponse {
  file_id: number;
  file_url: string; // 文件访问URL
  filename: string;
  size: number; // 文件大小（字节）
  type: FileType;
  content_type: string; // MIME类型
  uploaded_at: string;
}

/** 文件上传请求（FormData） */
export interface FileUploadRequest {
  file: File;
  conversation_id?: number; // 关联的对话ID
}

/** 文件信息实体 */
export interface FileInfo {
  file_id: number;
  filename: string;
  file_path: string;
  content_type: string;
  size: number;
  uploaded_by: number;
  uploaded_at: string;
}