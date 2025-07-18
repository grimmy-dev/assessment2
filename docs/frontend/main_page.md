## Frontend Overview

- Page: `app/page.tsx` (main interface)
- Uses components: HeroSection, Uploader, Predictor, Footer

State Management:

- currentTaskId: from backend on file upload
- canFetchDashboard: becomes true when backend signals task is ready
- uploadStatus: UI feedback for upload flow

Component Flow:
[HeroSection] → [Uploader] → [Predictor] → [Footer]

Uploader props:

- currentTaskId: string | null
- canFetchDashboard: boolean
- uploadStatus: idle | uploading | success | error
- onTaskIdChange, onCanFetchChange, onUploadStatusChange, onReset
