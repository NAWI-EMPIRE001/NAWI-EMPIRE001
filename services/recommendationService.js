const Product = require('../models/Product');
const Stream = require('../models/Stream');

class RecommendationService {

    async recommendProducts(limit = 10) {

        return await Product
            .find({ status: 'ACTIVE' })
            .sort({
                purchases: -1,
                createdAt: -1
            })
            .limit(limit);
    }

    async recommendStreams(limit = 10) {

        return await Stream
            .find({
                status: 'LIVE'
            })
            .sort({
                viewers: -1
            })
            .limit(limit);
    }
}

module.exports = new RecommendationService();