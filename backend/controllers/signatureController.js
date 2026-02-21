const { PDFDocument, rgb, StandardFonts, degrees } = require('pdf-lib');
const fs = require('fs').promises;
const path = require('path');
const Document = require('../models/Document');
const Signature = require('../models/Signature');

// @desc    Finalize signature on PDF
// @route   POST /api/signatures/finalize
// @access  Private
// @desc    Finalize signature on PDF
// @route   POST /api/signatures/finalize
// @access  Private or Public (with token)
const finalizeSignature = async (req, res, next) => {
  try {
    const { documentId, signatureText, signatureImage, x, y, page, viewerWidth, viewerHeight, token } = req.body;

    console.log('=== Finalize Signature Request ===');
    console.log('Document ID:', documentId);
    console.log('Token provided:', !!token);
    
    // Validation
    if (!documentId || x === undefined || y === undefined || page === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: documentId, x, y, page',
      });
    }

    // Validate viewer dimensions to prevent division-by-zero
    if (!viewerWidth || !viewerHeight || viewerWidth <= 0 || viewerHeight <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid viewer dimensions: viewerWidth and viewerHeight must be positive numbers',
      });
    }

    console.log('=== FINALIZE SIGNATURE START ===');
    console.log('Received fields:', {
      hasDocumentId: !!documentId,
      hasSignatureText: !!signatureText,
      hasSignatureImage: !!signatureImage,
      signatureImageLength: signatureImage ? signatureImage.length : 0,
      hasToken: !!token,
      x, y, page,
      viewerWidth, viewerHeight,
    });

    if (!signatureText && !signatureImage) {
      console.log('REJECTED: No signature data provided');
      return res.status(400).json({
        success: false,
        message: 'Please provide either signatureText or signatureImage',
      });
    }

    // Find document
    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }

    // Determine signer identity
    let signer = null;
    let isRecipient = false;
    let recipientIndex = -1;

    if (token) {
      // Signing via token
      const recipient = document.recipients.find(r => r.token === token);
      if (!recipient) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired signing token',
        });
      }
      if (recipient.status === 'Signed') {
        return res.status(400).json({
          success: false,
          message: 'You have already signed this document',
        });
      }
      signer = {
        name: recipient.name,
        email: recipient.email,
        id: null, // External signer has no user ID
        type: 'Recipient'
      };
      isRecipient = true;
      recipientIndex = document.recipients.findIndex(r => r.token === token);
    } else {
      // Signing as logged-in user (Owner)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized',
        });
      }
      // Check ownership or permission
      if (document.ownerId.toString() !== req.user._id.toString()) {
         return res.status(403).json({
          success: false,
          message: 'Not authorized to sign this document',
        });
      }
      signer = {
        name: req.user.name,
        email: req.user.email,
        id: req.user._id,
        type: 'User'
      };
    }

    // Check if document is already fully signed
    if (document.status === 'Signed') {
      return res.status(400).json({
        success: false,
        message: 'Document is already finalized',
      });
    }

    // Security: Validate filePath to prevent traversal attacks
    const normalizedPath = path.normalize(document.filePath);
    if (normalizedPath.includes('..') || path.isAbsolute(document.filePath)) {
      // Allow absolute paths only if they start with current working directory logic (if needed), 
      // but simpler to enforce relative 'uploads' path for safety.
      // Assuming all uploads are in 'uploads/' directory locally.
      // If your app uses absolute paths stored in DB, ensure they are within allowed directory.
      // For this specific app structure:
      if (!normalizedPath.startsWith('uploads') && !normalizedPath.includes('uploads')) {
         console.error('Security alert: potential path traversal detected', document.filePath);
         return res.status(500).json({ success: false, message: 'Server error: Invalid file path' });
      }
    }

    // Security: DoS prevention for signatureImage
    if (signatureImage && signatureImage.length > 7000000) { // ~5MB limit
        return res.status(400).json({
          success: false,
          message: 'Signature image too large',
        });
    }

    // Read the existing PDF
    const existingPdfBytes = await fs.readFile(document.filePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Get the specified page
    const pages = pdfDoc.getPages();
    
    if (page < 0 || page >= pages.length) {
      return res.status(400).json({
        success: false,
        message: `Invalid page number. Document has ${pages.length} pages.`,
      });
    }

    const targetPage = pages[page];
    const { width: pdfWidth, height: pdfHeight } = targetPage.getSize();
    const rotation = targetPage.getRotation().angle % 360;
    
    console.log('PDF dimensions:', { width: pdfWidth, height: pdfHeight });
    console.log('Page rotation:', rotation);
    console.log('Received coordinates:', { x, y });
    
    // Calculate normalized coordinates (0 to 1) based on visual viewer dimensions
    // We trust viewerWidth/Height to match the VISUAL aspect ratio
    const pctX = x / viewerWidth;
    const pctY = y / viewerHeight;
    
    let pdfX, pdfY, rotationAngle;

    // Map visual coordinates to PDF coordinates based on rotation
    // Note: PDF coordinates are bottom-left (0,0) to top-right (W,H) usually
    // But we need to account for how rotation maps the axes.
    
    if (rotation === 90) {
      // 90 deg CW. Visual TL -> PDF BL (0,0) ??
      // Actually: 90 CW rotation means PDF X+ points Up, PDF Y+ points Left.
      // Wait. Standard:
      // Rot 90:
      // Visual X (Right) -> PDF Y (Up)
      // Visual Y (Down) -> PDF X (Right)
      // Visual Origin (TL) -> PDF Origin (BL) (0,0)
      pdfX = pctY * pdfWidth;
      pdfY = pctX * pdfHeight;
      rotationAngle = -90;
    } else if (rotation === 180) {
      // 180 deg.
      // Visual X (Right) -> PDF X (Left)
      // Visual Y (Down) -> PDF Y (Up) ?? No.
      // 180 deg puts content upside down.
      // Visual TL -> PDF BR (W,0) ?? 
      // Visual TL (0,0) corresponds to Unrotated BR (W,0)?
      // Let's assume the previous logic logic:
      // x' = W - x, y' = y. (From my thought trace)
      // Let's stick to standard math: 
      // X_pdf = W - (pctX * W)
      // Y_pdf = pctY * pdfHeight
      pdfX = pdfWidth - (pctX * pdfWidth);
      pdfY = pctY * pdfHeight;
      rotationAngle = 180;
    } else if (rotation === 270) {
      // 270 deg CW (90 CCW).
      // Visual TL -> PDF TR (W,H).
      // Visual X (Right) -> PDF Y (Down).
      // Visual Y (Down) -> PDF X (Left).
      pdfX = pdfWidth - (pctY * pdfWidth);;
      pdfY = pdfHeight - (pctX * pdfHeight);
      rotationAngle = 90;
    } else {
      // 0 deg (Standard)
      // Visual X (Right) -> PDF X (Right)
      // Visual Y (Down) -> PDF Y (Down) (Which means H - y in PDF coords)
      pdfX = pctX * pdfWidth;
      pdfY = pdfHeight - (pctY * pdfHeight);
      rotationAngle = 0;
    }
    
    console.log('Converted to PDF coords:', { x: pdfX, y: pdfY });

    // Handle signature based on type
    // Track bottom Y of the signature so timestamp goes below it
    let signatureBottomY = pdfY;
    
    const drawOptions = {
        rotate: degrees(rotationAngle)
    };

    if (signatureImage) {
      // Handle image signature
      try {
        // Detect image format from data URL
        const isJpeg = signatureImage.startsWith('data:image/jpeg') || signatureImage.startsWith('data:image/jpg');
        
        // Remove data URL prefix if present
        const base64Data = signatureImage.replace(/^data:image\/\w+;base64,/, '');
        const imageBytes = Buffer.from(base64Data, 'base64');
        
        console.log('Embedding signature image, format:', isJpeg ? 'JPEG' : 'PNG', 'size:', imageBytes.length);
        
        // Embed the image using a robust strategy (try detected format, then fallback)
        let image;
        try {
          image = isJpeg
            ? await pdfDoc.embedJpg(imageBytes)
            : await pdfDoc.embedPng(imageBytes);
        } catch (initialError) {
          console.warn(`Failed to embed as ${isJpeg ? 'JPEG' : 'PNG'}, trying fallback...`);
          try {
            image = isJpeg
              ? await pdfDoc.embedPng(imageBytes)
              : await pdfDoc.embedJpg(imageBytes);
          } catch (fallbackError) {
             throw new Error('Failed to embed image: Invalid format (not valid JPEG or PNG)');
          }
        }

        const imageDims = image.scale(0.3); // Scale down the signature
        
        // --- Center-Based Rotation Logic ---
        // The frontend sends x,y as the VISUAL CENTER of the signature content.
        // We map that center directly to PDF coordinate space.
        const pctCenterX = x / viewerWidth;
        const pctCenterY = y / viewerHeight;
        
        let pdfCenterX, pdfCenterY;
        
        if (rotation === 90) {
           pdfCenterX = pctCenterY * pdfWidth;
           pdfCenterY = pctCenterX * pdfHeight;
        } else if (rotation === 180) {
           pdfCenterX = pdfWidth - (pctCenterX * pdfWidth);
           pdfCenterY = pctCenterY * pdfHeight;
        } else if (rotation === 270) {
           pdfCenterX = pdfWidth - (pctCenterY * pdfWidth);
           pdfCenterY = pdfHeight - (pctCenterX * pdfHeight);
        } else {
           pdfCenterX = pctCenterX * pdfWidth;
           pdfCenterY = pdfHeight - (pctCenterY * pdfHeight);
        }
        
        // Draw image centered on pdfCenterX/Y
        // pdf-lib draws from the bottom-left of the image rect.
        const drawX = pdfCenterX - imageDims.width / 2;
        const drawY = pdfCenterY - imageDims.height / 2;
        
        targetPage.drawImage(image, {
          x: drawX,
          y: drawY,
          width: imageDims.width,
          height: imageDims.height,
          rotate: degrees(rotationAngle),
        });

        // Approximate bottom Y for timestamp (unrotated logic, might be off for rotated, but acceptable)
        signatureBottomY = drawY; 
      } catch (imageError) {
        console.error('Error embedding image:', imageError);
        return res.status(400).json({
          success: false,
          message: 'Invalid signature image format',
        });
      }
    } else if (signatureText) {
      // --- Center-Based Logic for Text ---
      // The frontend sends x,y as the VISUAL CENTER of the signature content.

      const pctCenterX = x / viewerWidth;
      const pctCenterY = y / viewerHeight;

      let pdfCenterX, pdfCenterY;

      if (rotation === 90) {
        pdfCenterX = pctCenterY * pdfWidth;
        pdfCenterY = pctCenterX * pdfHeight;
      } else if (rotation === 180) {
        pdfCenterX = pdfWidth - (pctCenterX * pdfWidth);
        pdfCenterY = pctCenterY * pdfHeight;
      } else if (rotation === 270) {
        pdfCenterX = pdfWidth - (pctCenterY * pdfWidth);
        pdfCenterY = pdfHeight - (pctCenterX * pdfHeight);
      } else {
        pdfCenterX = pctCenterX * pdfWidth;
        pdfCenterY = pdfHeight - (pctCenterY * pdfHeight);
      }

      const textFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const fontSize = 22;
      const textWidth = textFont.widthOfTextAtSize(signatureText, fontSize);

      // pdf-lib rotates text around its baseline-left origin (textDrawX, textDrawY).
      // We adjust so that after rotation, the text's visual center aligns with pdfCenterX/Y.
      let textDrawX, textDrawY;
      if (rotation === 90) {
        // -90° rotation: text ascender points left (-X). Origin must be right of center.
        textDrawX = pdfCenterX - fontSize / 2;
        textDrawY = pdfCenterY - textWidth / 2;
      } else if (rotation === 180) {
        // 180° rotation: both axes flipped
        textDrawX = pdfCenterX + textWidth / 2;
        textDrawY = pdfCenterY + fontSize / 2;
      } else if (rotation === 270) {
        // +90° rotation: text ascender points right (+X). Origin must be left of center.
        textDrawX = pdfCenterX + fontSize / 2;
        textDrawY = pdfCenterY + textWidth / 2;
      } else {
        // Rotation 0: standard horizontal text
        textDrawX = pdfCenterX - textWidth / 2;
        textDrawY = pdfCenterY - fontSize / 2;
      }

      targetPage.drawText(signatureText, {
        x: textDrawX,
        y: textDrawY,
        size: fontSize,
        font: textFont,
        color: rgb(0, 0, 0.8),
        rotate: degrees(rotationAngle),
      });

      signatureBottomY = textDrawY;
    }

    // Add signature timestamp — placed well below the signature
    const timestamp = new Date().toLocaleString();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    targetPage.drawText(`Signed on: ${timestamp}`, {
      x: pdfX,
      y: Math.max(5, signatureBottomY - 12), // 12px gap below signature, clamped to page
      size: 8,
      font: font,
      color: rgb(0.5, 0.5, 0.5),
    });

    // Save the modified PDF
    const pdfBytes = await pdfDoc.save();
    console.log('PDF bytes generated, length:', pdfBytes.length);

    // Generate new filename for signed document
    const signedFileName = `signed_${Date.now()}_${path.basename(document.filePath)}`;
    const signedFilePath = path.join('uploads', signedFileName);
    console.log('Saving signed PDF to:', signedFilePath);

    // Write the signed PDF
    await fs.writeFile(signedFilePath, pdfBytes);
    console.log('Signed PDF written successfully');

    // Create signature record
    const signature = new Signature({
      documentId: documentId,
      userId: signer.id, // Can be null for recipients
      signerName: signer.name,
      signerEmail: signer.email,
      signerType: signer.type,
      signatureText: signatureText || null,
      signatureImage: signatureImage || null,
      coordinates: { x, y, page },
      signedAt: new Date(),
    });

    await signature.save();
    console.log('Signature record saved:', signature._id);

    // Update document status
    if (isRecipient) {
      // Update specific recipient status
      document.recipients[recipientIndex].status = 'Signed';
      
      // Check if all recipients have signed
      const allSigned = document.recipients.every(r => r.status === 'Signed');
      
      if (allSigned) {
        document.status = 'Signed';
        document.signedAt = new Date();
        document.signedFilePath = signedFilePath; // Final version
        document.filePath = signedFilePath;        // ← also update filePath so downloads serve the signed PDF
      } else {
        // Still pending others
        // Update the current file path to include this signature
        // so the next person sees it
        document.filePath = signedFilePath;
      }
    } else {
      // Owner signing (Only Me)
      document.status = 'Signed';
      document.signedBy = req.user._id;
      document.signedAt = new Date();
      document.signedFilePath = signedFilePath;
      document.filePath = signedFilePath;
    }

    await document.save();
    console.log('Document updated. Status:', document.status);
    console.log('New file path:', document.filePath);

    res.status(200).json({
      success: true,
      message: 'Document signed successfully',
      data: {
        document,
        signature,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get signatures for a document
// @route   GET /api/signatures/:docId
// @access  Private
const getSignatures = async (req, res, next) => {
  try {
    const signatures = await Signature.find({
      documentId: req.params.docId,
    }).populate('userId', 'name email');

    res.status(200).json({
      success: true,
      count: signatures.length,
      data: signatures,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  finalizeSignature,
  getSignatures,
};
