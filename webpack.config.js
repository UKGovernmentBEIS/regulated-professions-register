const Encore = require('@symfony/webpack-encore');

// Manually configure the runtime environment if not already configured yet by the "encore" command.
// It's useful when you use tools that rely on webpack.config.js file.
if (!Encore.isRuntimeEnvironmentConfigured()) {
  Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

Encore.setOutputPath('public/')
  .setPublicPath('/')
  .addEntry('app', './assets/app.js')
  .splitEntryChunks()
  .enableSingleRuntimeChunk()
  .cleanupOutputBeforeBuild()
  .enableSourceMaps(!Encore.isProduction())
  .enableVersioning(Encore.isProduction())
  .configureBabelPresetEnv((config) => {
    config.useBuiltIns = 'usage';
    config.corejs = 3;
  })
  // copying govuk-frontend images
  .copyFiles({
    from: './node_modules/govuk-frontend/govuk/assets/images',
    to: 'images/[path][name].[ext]',
  })
  // copying govuk-frontend fonts
  .copyFiles({
    from: './node_modules/govuk-frontend/govuk/assets/fonts',
    to: 'fonts/[path][name].[ext]',
  })
  .enableSassLoader(function (options) {
    options.sassOptions = {
      includePaths: ['node_modules/govuk-frontend/'],
      outputStyle: 'compressed',
    };
  });

// uncomment if you use TypeScript
//.enableTypeScriptLoader()

// uncomment to get integrity="..." attributes on your script & link tags
// requires WebpackEncoreBundle 1.4 or higher
//.enableIntegrityHashes(Encore.isProduction())

// uncomment if you're having problems with a jQuery plugin
//.autoProvidejQuery()

// uncomment if you use API Platform Admin (composer require api-admin)
//.enableReactPreset()
//.addEntry('admin', './assets/admin.js')

module.exports = Encore.getWebpackConfig();
