// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"app.js":[function(require,module,exports) {
var ajax = new XMLHttpRequest();
var content = document.createElement('div');
var NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json';
var CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
var container = document.getElementById('root');
var store = {
  currentPage: 1,
  feeds: []
};

function getData(url) {
  ajax.open('GET', url, false);
  ajax.send();
  return JSON.parse(ajax.response);
}

function makeFeeds(feeds) {
  for (var i = 0; i < feeds.length; i++) {
    feeds[i].read = false;
  }

  return feeds;
}

function newsFeed() {
  var newsFeed = store.feeds;
  var newsList = [];
  var template = "\n  <section class=\"main\">\n    <header class=\"title\">\n      <h1>Hacker News</h1>\n    </header>\n    <main class=\"news-list\">\n      {{__news_feed__}}\n    </main>\n    <div class=\"pagination\">\n      <a href=\"#/page/{{__prev_page__}}\">\n        Previous\n      </a>\n      <a href=\"#/page/{{__next_page__}}\">\n        Next\n      </a>\n    </div>\n  </section>\n  ";

  if (newsFeed.length === 0) {
    newsFeed = store.feeds = makeFeeds(getData(NEWS_URL));
  }

  for (var i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
    newsList.push("\n    <section class=\"content\" ".concat(newsFeed[i].read ? 'style="background-color:#d3eedb;' : 'style="background-color:#fff"";', ">\n      <a href=\"#/show/").concat(newsFeed[i].id, "\">\n      <div class=\"content-title\">\n        <h2>").concat(newsFeed[i].title, "</h2>\n        <span class=\"content-comment\">").concat(newsFeed[i].comments_count, "</span>\n      </div>\n      <div class=\"content-info\">\n        <div class=\"user-name\">\n          <i class=\"fas fa-user\"></i> \n          <span>").concat(newsFeed[i].user, "</span>\n        </div>\n        <div class=\"like\">\n          <i class=\"fas fa-thumbs-up\"></i>\n          <span>").concat(newsFeed[i].points, "</span>\n        </div>\n        <div class=\"time-ago\">\n          <i class=\"far fa-clock\"></i>\n          <span>").concat(newsFeed[i].time_ago, "</span>\n        </div>\n      </div>\n      </a>\n    </section>\n  "));
  }

  template = template.replace('{{__news_feed__}}', newsList.join(''));
  template = template.replace('{{__prev_page__}}', store.currentPage > 1 ? store.currentPage - 1 : 1);
  template = template.replace('{{__next_page__}}', store.currentPage + 1);
  container.innerHTML = template;
}

function newsDetail() {
  var id = location.hash.substr(7);
  var newsContent = getData(CONTENT_URL.replace('@id', id));
  var template = "\n    <header class=\"title\">  \n      <h1>Hacker News</h1>\n        <a href=\"#/page/".concat(store.currentPage, "\" class=\"pagination\">\n          <i class=\"fas fa-times\"></i>\n        </a>\n    </header>\n    <section class=\"contents\">\n      <div class=\"contents-title\">\n        <h2>").concat(newsContent.title, "</h2>\n      </div>\n      <div class=\"contents-main\">\n        ").concat(newsContent.content, "\n      </div>\n      <div class=\"contents-comment\">\n        {{__comments__}}\n      </div>\n      </section>\n  ");

  for (var i = 0; i < store.feeds.length; i++) {
    if (store.feeds[i].id === Number(id)) {
      store.feeds[i].read = true;
      break;
    }
  }

  function makeComment(comments) {
    var called = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var commentString = [];

    for (var _i = 0; _i < comments.length; _i++) {
      commentString.push("\n      <div class=\"comments-box\" style=\"padding-left:".concat(called * 40, "px;\">\n        <div class=\"comments-info\">\n          <div class=\"comments-icon\">\n            <i class=\"far fa-comment-alt\"></i>\n          </div>\n          <div class=\"user-name\">\n            <i class=\"fas fa-user\"></i> \n            <span>").concat(comments[_i].user, "</span>\n          </div>\n          <div class=\"time-ago\">\n            <i class=\"far fa-clock\"></i>\n            <span>").concat(comments[_i].time_ago, "</span>\n          </div>    \n        </div>\n        <div class=\"comments-main\">\n          ").concat(comments[_i].content, "\n        </div>\n      </div>\n        \n      "));

      if (comments[_i].comments.length > 0) {
        commentString.push(makeComment(comments[_i].comments, called + 1));
      }
    }

    return commentString.join('');
  }

  container.innerHTML = template.replace('{{__comments__}}', makeComment(newsContent.comments));
}

function router() {
  var routerPath = location.hash;

  if (routerPath === '') {
    newsFeed();
  } else if (routerPath.indexOf('#/page/') >= 0) {
    store.currentPage = Number(routerPath.substr(7));
    newsFeed();
  } else {
    newsDetail();
  }
}

window.addEventListener('hashchange', function () {
  router();
});
router();
},{}],"../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "59655" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","app.js"], null)
//# sourceMappingURL=/app.c328ef1a.js.map