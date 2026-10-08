-- Existing assets are images; a null MIME type preserves that behavior.
ALTER TABLE "MediaAsset" ADD COLUMN "mimeType" TEXT;
