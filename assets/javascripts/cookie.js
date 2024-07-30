var CookieConsent = function () {
  this.init = function (gaId, gaDomain) {
    this._gaId = gaId;
    this._gaDomain = gaDomain;
    this._gaSrc = 'https://www.googletagmanager.com/gtag/js?id=' + gaId;
    this.addListener('cookie-accept', 'click', this.cookiesAccepted.bind(this));
    this.addListener('cookie-reject', 'click', this.cookiesRejected.bind(this));
    this.addListener(
      'cookie-accepted-hide',
      'click',
      this.hideBanner.bind(this),
    );
    this.addListener(
      'cookie-rejected-hide',
      'click',
      this.hideBanner.bind(this),
    );
    this.addListener(
      'cookie-pref-save',
      'click',
      this.savePreferences.bind(this),
    );

    this.populateCookiePreferences();
    this.setupGoogleAnalyticsTagIfOptedIn();
    if (this.cookiePreferencesSet()) {
      this.hideBanner();
    } else {
      this.showBanner();
    }

    const cookiePolicy = this.retrieveCookiePolicy();
    if (!cookiePolicy || !cookiePolicy.usage) {
      this.clearGoogleAnalyticsCookies();
    }
  };

  this.hideBanner = function () {
    this.hide('cookie-banner');
  };

  this.showBanner = function () {
    this.show('cookie-banner');
  };

  this.addListener = function (name, event, callback) {
    var element = document.getElementById(name);
    if (element) {
      element.addEventListener('click', callback, false);
    }
  };

  this.cookiesAccepted = function () {
    this.hide('cookie-banner-unconfirm');
    this.show('cookie-accepted-confirm');

    this.storeCookiePolicy(true,true,true);
    this.storeCookiePreferencesSet(true);
    this.setupGoogleAnalyticsTagIfOptedIn();
  };

  this.cookiesRejected = function () {
    this.hide('cookie-banner-unconfirm');
    this.show('cookie-rejected-confirm');

    this.storeCookiePolicy(true,false,true);
    this.storeCookiePreferencesSet(true);
    this.deleteGoogleAnalyticsCookie();
    this.setupGoogleAnalyticsTagIfOptedIn();
  };

  this.hide = function (name) {
    var element = document.getElementById(name);
    if (element) {
      element.classList.add('govuk-visually-hidden');
    }
  };

  this.show = function (name) {
    var element = document.getElementById(name);
    if (element) {
      element.classList.remove('govuk-visually-hidden');
    }
  };

  this.focus = function (name) {
    var element = document.getElementById(name);
    if (element) {
      element.focus();
    }
  };

  // Cookie
  this.storeCookiePolicy = function (essential, usage, campaigns) {
    this.createCookie(
      'cookie_policy',
      JSON.stringify({
        essential: essential, 
        usage: usage,
        campaigns: campaigns
      }),
    );
  };

  this.createCookie = function (key, value, date) {
    var expiration = date
      ? new Date(date).toUTCString()
      : new Date(
          new Date().getTime() + 365 * 24 * 60 * 60 * 1000,
        ).toUTCString();
    var cookie =
      escape(key) + '=' + escape(value) + ';expires=' + expiration + '; path=/';
    document.cookie = cookie;
  };

  this.readCookie = function (name) {
    var key = name + '=';
    var cookies = document.cookie.split(';');
    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      while (cookie.charAt(0) === ' ') {
        cookie = unescape(cookie.substring(1, cookie.length));
      }
      if (cookie.indexOf(key) === 0) {
        return unescape(cookie.substring(key.length, cookie.length));
      }
    }
    return null;
  };

  this.storeCookiePreferencesSet = function (seen) {
    var threeMonths = new Date();
    threeMonths.setMonth(threeMonths.getMonth() + 3);
    this.createCookie(
      'cookie_preferences_set',
      true,
      threeMonths.getTime(),
    );
  };

  this.cookiePreferencesSet = function () {
    return this.readCookie('cookie_preferences_set') || false;
  };

  this.deleteCookiePolicy = function () {
    this.createCookie('cookie_policy', '', new Date(1970, 1, 1));
  };

  this.retrieveCookiePolicy = function () {
    var cookiePolicy = this.readCookie('cookie_policy');
    if (cookiePolicy) {
      try {
        return JSON.parse(cookiePolicy);
      } catch (e) {
        console.log(e);
      }
    }
    return {
      essential: false, 
      usage: false,
      campaigns: false
    };
  };

  // Google Analytics
  this.gtag = function () {
    if (dataLayer) {
      dataLayer.push(arguments);
    }
  };

  this.isGoogleAnalyticsLoaded = function () {
    var scripts = document.getElementsByTagName('script');
    for (var i = 0; i < scripts.length; i++) {
      if (scripts[i].src === this._gaSrc) {
        return true;
      }
    }
    return false;
  };

  this.deleteGoogleAnalyticsCookie = function (key) {
    var expiration = new Date(2000, 1, 1);
    var cookie =
      escape(key) +
      '=;expires=' +
      expiration +
      '; path=/; domain=' +
      this._gaDomain +
      ';';
    document.cookie = cookie;
  };

  this.clearGoogleAnalyticsCookies = function () {
    this.deleteGoogleAnalyticsCookie('_ga');
    this.deleteGoogleAnalyticsCookie('_gid');
    this.deleteGoogleAnalyticsCookie('_ga' + this._gaId.replace(/G-/g, '_'));
  };

  this.setupGoogleAnalyticsTagIfOptedIn = function () {
    var cookiePolicy = this.retrieveCookiePolicy();
    if (
      !cookiePolicy ||
      !cookiePolicy.usage ||
      this.isGoogleAnalyticsLoaded()
    ) {
      return;
    }

    window.dataLayer = window.dataLayer || [];
    this.gtag('js', new Date());
    this.gtag('config', this._gaId);

    var head = document.getElementsByTagName('head')[0];
    var js = document.createElement('script');
    js.async = 'true';
    js.src = this._gaSrc;
    head.appendChild(js);
  };

  // preferences
  this.populateCookiePreferences = function () {
    var cookieConsentYes = document.getElementById('cookies-analytics');
    var cookieConsentNo = document.getElementById('cookies-analytics-2');

    if (!cookieConsentNo || !cookieConsentYes) {
      return;
    }

    const cookiePolicy = this.retrieveCookiePolicy();
    if (!cookiePolicy || !cookiePolicy.usage) {
      cookieConsentNo.checked = true;
    } else {
      cookieConsentYes.checked = true;
    }
  };

  this.savePreferences = function () {
    var cookieConsentYes = document.getElementById('cookies-analytics');
    var cookieConsentNo = document.getElementById('cookies-analytics-2');
    if (cookieConsentYes && cookieConsentNo) {
      this.hideBanner();
      this.show('cookie-preference-saved');
      this.focus('cookie-preference-saved-heading');

      if (cookieConsentYes.checked) {
        this.storeCookiePolicy(true,true,true);
        this.setupGoogleAnalyticsTagIfOptedIn();
      }
      if (cookieConsentNo.checked) {
        this.clearGoogleAnalyticsCookies();
        this.storeCookiePolicy(true,false,true);
      }
      this.storeCookiePreferencesSet(true);
    }
  };
};
window.CookieConsent = new CookieConsent();
