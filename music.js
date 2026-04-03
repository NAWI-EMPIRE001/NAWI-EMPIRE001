// THE IMPERIAL MUSIC SCHEMA (server.js)
const MusicSchema = new mongoose.Schema({
    artistId: String,
    title: String,
    type: { type: String, enum: ['MP3', 'MP4'] },
    isPromoted: { type: Boolean, default: false },
    downloadCount: { type: Number, default: 0 },
    // 🛡️ THE EVIDENCE LOG
    licenseHash: String, // Unique ID proving it's an Empire Original
    authorizedFrameUrl: String // The Cover Art with your Gold Frame
});

// THE DOWNLOAD & BRANDING ENGINE
app.get('/api/download-media/:mediaId', async (req, res) => {
    const media = await Music.findById(req.params.mediaId);
    
    // 1. Record the Transaction in the Ledger
    const downloadRecord = new Transaction({
        userId: req.user._id,
        action: "AUTHORIZED_DOWNLOAD",
        item: media.title,
        status: "VERIFIED_BY_NODE_001"
    });
    
    await downloadRecord.save();

    // 2. Serve the File with the Empire ID in the filename
    const brandedFileName = `NAWI_EMPIRE_001_${media.title}_AUTHORIZED.mp3`;
    res.download(media.filePath, brandedFileName);
});
