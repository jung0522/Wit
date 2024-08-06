import { S3Client } from '@aws-sdk/client-s3';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import dotenv from 'dotenv';

// import { createUUID } from './uuid.js';
import { BaseError } from '../config/error.js';
import { errStatus } from '../config/errorStatus.js';

dotenv.config();

const s3 = new S3Client({
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
});

const allowedExtensions = ['.png', '.jpg', '.jpeg', '.bmp', '.gif'];

export const imageUploader = multer({
  storage: multerS3({
    s3: s3, // S3 객체
    bucket: process.env.S3_BUCKET_NAME, // Bucket 이름
    contentType: multerS3.AUTO_CONTENT_TYPE, // Content-type, 자동으로 찾도록 설정
    key: (req, file, callback) => {
      // 파일명
      const uploadDirectory = 'user-profile-image'; // 디렉토리 path 설정을 위해서
      const extension = path.extname(file.originalname); // 파일 이름 얻어오기
      const { user_id } = req.params;
      // 여기서 uuid 써서 url 만들면 이미지 get 요청시 여기서 만든 uuid를 어떻게 url로 전달할까?
      // const uuid = createUUID();
      // extension 확인을 위한 코드 (확장자 검사용)
      if (!allowedExtensions.includes(extension)) {
        return callback(new BaseError(errStatus.WRONG_EXTENSION));
      }

      callback(null, `${uploadDirectory}/${user_id}`);
    },
    acl: 'public-read-write', // 파일 액세스 권한
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // File size limit (5MB)
});
