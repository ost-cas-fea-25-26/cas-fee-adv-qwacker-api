module.exports = (options, webpack) => {
  return {
    ...options,
    entry: {
      main: options.entry,
    },
    output: {
      ...options.output,
      filename: '[name].js',
    },
    externals: [
      ...options.externals,
    ],
  };
};
