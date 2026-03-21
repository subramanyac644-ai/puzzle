// Simple 1x1 base64 transparent png
const base64Data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
const buffer = Buffer.from(base64Data, 'base64');
require('fs').writeFileSync('c:/Users/subramanya c/.gemini/antigravity/playground/core-hubble/test_upload.png', buffer);
