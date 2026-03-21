// Simple 1x1 base64 transparent gif
const base64Data = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const buffer = Buffer.from(base64Data, 'base64');
require('fs').writeFileSync('c:/Users/subramanya c/.gemini/antigravity/playground/core-hubble/test_upload.gif', buffer);
