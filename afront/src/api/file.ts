import api from './index';
import { FileUploadResponse, FileInfo } from '../types/file';

/**
 * 上传文件
 * @param file - 文件对象
 * @param conversationId - 关联对话ID（可选）
 */
export const uploadFile = async (
    file: File,
    conversationId?: number
): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    if (conversationId) {
        formData.append('conversation_id', conversationId.toString());
    }

    const response = await api.post('/files/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * 获取文件信息
 * @param fileId - 文件ID
 */
export const getFileInfo = async (fileId: number): Promise<FileInfo> => {
    const response = await api.get(`/files/${fileId}`);
    return response.data;
};

/**
 * 删除文件
 * @param fileId - 文件ID
 */
export const deleteFile = async (fileId: number): Promise<{ message: string }> => {
    const response = await api.delete(`/files/${fileId}`);
    return response.data;
};

/**
 * 获取文件下载链接
 * @param fileId - 文件ID
 */
export const getFileDownloadUrl = async (fileId: number): Promise<{ url: string }> => {
    const response = await api.get(`/files/${fileId}/download`);
    return response.data;
};