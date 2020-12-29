var gulp = require('gulp'),
  less = require('gulp-less'),        // less转css
  postCss = require('gulp-postcss'),          // CSS预处理
  postcssAutoprefixer = require('autoprefixer'),      // 自动补齐css
  bs = require('browser-sync').create(),
  del = require('del'),
  path = require('path'),
  posthtml = require('gulp-posthtml');  // HTML 预处理
posthtmlPx2rem = require('posthtml-px2rem');  // HTML 内联 CSS 转换 `px` 为 `rem`
postcssPxtorem = require('postcss-pxtorem'),    // css 中 px转rem
  proxyMiddleware = require('http-proxy-middleware'),     // 代理服务器
  minifyImg = require('gulp-imagemin'),           // 亚索图片
  ejs = require('gulp-ejs'),                      // 模板
  ejshelper = require('tmt-ejs-helper'),
  minifycss = require('gulp-minify-css'),         // 亚索CSS
  tap = require('gulp-tap'),
  fs = require('fs'),
  concat = require('gulp-concat'),   //合并文件
  uglify = require('gulp-uglify'),   //js压缩
  rename = require('gulp-rename'),   //文件重命名
  jshint = require('gulp-jshint');   //js检查;  npm install --save-dev jshint gulp-jshint
minifyCss = require('gulp-minify-css');                     //- 压缩CSS为一行；
// rev = require('gulp-rev');                                  //- 对文件名加MD5后缀

var paths = {
  src: {
    dir: './src',
    html: './src/**/*.html',
    images: './src/images/**/*.{JPG,jpg,png,gif}',
    scripts: './src/scripts/**/*.js',      // ['./src/scripts/**/*.js','./src/js/**/*.js'],
    styles: './src/styles/**/*.less',          // ['./src/styles/**/*.less', '!./src/styles/_*/**.less','./src/css/**/*.less'],
    fonts: './src/fonts/**/*.{eot,svg,tff,woff,woff2}',
    resource: './src/audio/*.*'
  },
  dev: {
    dir: './dev'
  }
}

function delDev () {
  return del(paths.dev.dir);
}

function copyHandler (type, file) {
  file = file || paths['src'][type];
  console.log(file);
  return gulp.src(file, { base: paths.src.dir })
    .pipe(gulp.dest(paths.dev.dir))
    .on('end', function () {
      bs.reload();
    });
}

function copyHtml () {
  return gulp.src(paths.src.html, { base: paths.src.dir })
    .pipe(ejs(ejshelper()).on('error', function (error) {
      console.log(error.message);
    }))
    .pipe(posthtml([
      posthtmlPx2rem({
        rootValue: 100,
        minPixelValue: 2
      })
    ])
    )
    .pipe(gulp.dest(paths.dev.dir))
    .on('end', function () { bs.reload(); })
}

function copyImg () {
  return gulp.src(paths.src.images, { base: paths.src.dir })
    .pipe(gulp.dest(paths.dev.dir))
    .on('end', function () {
      bs.reload();
    });
}

function copyJs () {
  return copyHandler('scripts');
}

function copyFonts () {
  return copyHandler('fonts');
}

function copyResource () {
  return copyHandler('resource');
}

function toLess () {
  // file = file || paths.src.styles;
  // console.log(file);
  var processors = [
    postcssAutoprefixer({ browsers: ['last 10 versions'] }),
    postcssPxtorem({
      rootValue: 100,     // 基准值 html{ font-zise: 20px; }
      propList: ['*'],        // 使用所有属性
      minPixelValue: 2        // 忽略1px
    })
  ];
  return gulp.src(paths.src.styles, { base: paths.src.dir })
    .pipe(less())
    .pipe(postCss(processors))
    // .pipe(minifycss())
    .pipe(gulp.dest(paths.dev.dir))
    .on('end', function () {
      bs.reload();
    });
}

function minify () {
  // return gulp.src('js/*.js')
  // .pipe(uglify())
  // .pipe(gulp.dest('build'));
  return gulp.src(['.src/scripts/libs/core.js', '.src/scripts/libs/fastclick.min.js', '.src/scripts/libs/clipboard.min.js', '.src/scripts/pages/act-pack.js'])  //选择合并的JS
    .pipe(concat('order_query.js'))   //合并js
    .pipe(gulp.dest('dist/js'))         //输出
    .pipe(rename({ suffix: '.min' }))     //重命名
    .pipe(uglify())                    //压缩
    .pipe(gulp.dest('dist/js'))            //输出
}

function liveBrowser () {

  var proxy = proxyMiddleware('**/fspay/**', {
    target: 'http://120.76.215.80:8100', // 目标主机
    changeOrigin: true,               // 虚拟托管站点所需
    onError: function (err, req, res) {
      console.log(err);
    },
    onProxyRes: function (proxyRes, req, res) {
      console.log(proxyRes.statusCode);
    }
  });
  // 开始一个Browsersync静态文件服务器
  bs.init({
    server: {
      baseDir: paths.dev.dir
    },
    middleware: [proxy],
  });
}

function watchHandler (type, file) {
  var target;
  if (file.match(/html|htm/i) && file.match(/html|htm/i)[0]) {
    target = 'html';
  } else {
    target = file.match(/^src\/(.*?)\//)[1];
  }

  if (type === 'removed') {
    var temp = file.replace('src', 'dev');
    del(temp);
  } else {
    if (target === 'styles' || target === 'css') {
      toLess();
    } else if (target === 'images') {
      copyImg();
    } else {
      copyHandler(target, file);
    }
  }


}

function watch (done) {
  var watcher = gulp.watch([
    paths.src.html,
    paths.src.images,
    paths.src.scripts,
    paths.src.fonts,
    paths.src.styles,
    paths.src.resource
  ]);
  watcher
    .on('change', function (file) {      // file: src\index.html
      console.log(file);
      watchHandler('change', file.split(path.sep).join('/'));
    }).on('add', function (file) {
      watchHandler('add', file.split(path.sep).join('/'));
    }).on('unlink', function (file) {
      watchHandler('removed', file.split(path.sep).join('/'));
    });
  done();
}



gulp.task('build', gulp.series(
  delDev,
  gulp.parallel(
    copyHtml,
    copyImg,
    copyJs,
    copyFonts,
    copyResource,
    toLess
  ),
  watch,
  liveBrowser
));

var filesList = [],
  lstF = 'file:ejbs/webinfo/version3/H5/orchardAct/',
  lstL = ':WEB';

function getLST () {
  return gulp.src('./list/**/*.*')
    .pipe(tap(function (file, t) {
      filesList.push(lstF + file.path.split(path.sep).join('/').split('list/')[1] + lstL);
    }));
}

function writeLST (cb) {
  fs.writeFile(path.resolve() + path.sep + "CMF.lst", filesList.join("\n"), function (err) {
    if (err) throw err;
    console.log("写入成功");
    cb();
  });
}

// 生成清单
gulp.task('build_lst', gulp.series(
  getLST,
  writeLST
));


//压缩合并JS
gulp.task('minifyjs', function () {
  return gulp.src(['src/scripts/common/advsCore.js'])  //选择合并的JS
    .pipe(concat('advsCore.js'))   //合并js
    // .pipe(gulp.dest('dist/js'))         //输出
    .pipe(rename({ suffix: '.min' }))     //重命名
    .pipe(uglify())                    //压缩
    .pipe(gulp.dest('dist/js'))            //输出
});

//压缩合并css
gulp.task('minifycss', function () {                                //- 创建一个名为 concat 的 task
  gulp.src(['src/styles/common/common.css'])    //- 需要处理的css文件，放到一个字符串数组里
    .pipe(concat('common.minify.css'))                            //- 合并后的文件名
    .pipe(minifyCss())                                      //- 压缩处理成一行
    // .pipe(rev())                                            //- 文件名加MD5后缀
    .pipe(gulp.dest('src/styles/minifycss'))                               //- 输出文件本地
});