const Jimp = require('jimp');

async function applyEmpireSeal(userImagePath, outputPath) {
    // 1. Load the User's Product and the Empire Gold Logo
    const [productImage, empireLogo] = await Promise.all([
        Jimp.read(userImagePath),
        Jimp.read('./assets/empire-gold-logo.png') // Your Node 001 Original Logo
    ]);

    // 2. Resize Logo to be 15% of the product size (Professional, not bulky)
    empireLogo.resize(productImage.bitmap.width * 0.15, Jimp.AUTO);

    // 3. Place Logo in the bottom-right corner
    const xMargin = productImage.bitmap.width - empireLogo.bitmap.width - 20;
    const yMargin = productImage.bitmap.height - empireLogo.bitmap.height - 20;

    productImage.composite(empireLogo, xMargin, yMargin, {
        mode: Jimp.BLEND_SOURCE_OVER,
        opacitySource: 0.8 // Slightly transparent to look high-end
    });

    // 4. Save the "Authorized Original"
    await productImage.writeAsync(outputPath);
}
