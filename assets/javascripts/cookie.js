var CookieConsent = function () {
  this.init = function () {
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
    if (this.cookiePreferencesSet()) {
      this.hideBanner();
    } else {
      this.showBanner();
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
  };

  this.cookiesRejected = function () {
    this.hide('cookie-banner-unconfirm');
    this.show('cookie-rejected-confirm');

    this.storeCookiePolicy(true,false,true);
    this.storeCookiePreferencesSet(true);
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

  this.storeCookiePreferencesSet = function () {
    this.createCookie(
      'cookie_preferences_set',
      true
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
      }
      if (cookieConsentNo.checked) {
        this.storeCookiePolicy(true,false,true);
      }
      this.storeCookiePreferencesSet(true);
    }
  };
};
window.CookieConsent = new CookieConsent();
