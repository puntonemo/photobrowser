import { CoreRequest, CoreService } from '@core';
import * as controllers from '../controllers';
import path from 'path';

// Mapa básico de extensiones a tipos MIME
const mimeMap: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
};

export const test = new CoreService(
    {
        get: '/api/pb/test',
    },
    async () => {
        return { result: 'success ' };
    },
);

export const metadata = new CoreService(
    {
        get: '/api/pb/metadata',
    },
    async () => {
        controllers.extractPendingMetadata();
        return { result: 'success ' };
    },
);

export const image = new CoreService(
    {
        get: '/api/pb/image/:id',
    },
    async (request: CoreRequest) => {
        const files = [
            `/home/david/MyPhoto/SmartUpload/Z Flip6 de David/2025/05/2025_05_22_upload/20250522_085233.jpg`, 
            `/home/david/MyPhoto/SmartUpload/Z Flip6 de David/2025/05/2025_05_22_upload/20250522_085236.jpg`,
            `/home/david/MyPhoto/SmartUpload/Z Flip6 de David/2025/05/2025_05_22_upload/20250522_095202.jpg`,
            `/home/david/MyPhoto/SmartUpload/Z Flip6 de David/2025/05/2025_05_22_upload/20250522_091023.mp4`
        ];
        const absolutePath = files[+request.params.id];
        
        const ext = path.extname(absolutePath).toLowerCase();
        const mimeType = mimeMap[ext] || 'application/octet-stream';
        console.log(absolutePath, mimeType);
        return request.sendFile(absolutePath, mimeType);
    },
);
