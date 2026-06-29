const Product = require('../models/Product');
const User = require('../models/User');
const Stream = require('../models/Stream');

class SearchService {

    async globalSearch(keyword) {

        const regex = new RegExp(keyword, 'i');

        const [products, creators, streams] =
            await Promise.all([

                Product.find({
                    $or: [
                        { name: regex },
                        { description: regex }
                    ]
                }).limit(10),

                User.find({
                    username: regex
                })
                .select('username avatar')
                .limit(10),

                Stream.find({
                    title: regex
                }).limit(10)

            ]);

        return {
            products,
            creators,
            streams
        };
    }
}

module.exports = new SearchService();