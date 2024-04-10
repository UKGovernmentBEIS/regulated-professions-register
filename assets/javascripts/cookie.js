var CookieConsent = function () {
    this.init = function (gaId, gaDomain) {
        this._gaId = gaId
        this._gaDomain = gaDomain
        this._gaSrc = "https://www.googletagmanager.com/gtag/js?id=" + gaId
        this.addListener("cookie-accept", "click", this.cookiesAccepted.bind(this))
        this.addListener("cookie-reject", "click", this.cookiesRejected.bind(this))
        this.addListener("cookie-accepted-hide", "click", this.hideBanner.bind(this))
        this.addListener("cookie-rejected-hide", "click", this.hideBanner.bind(this))
        this.setupGoogleAnalyticsTagIfOptedIn()
        if (this.cookieMessageSeen()){
          this.hideBanner()
        } else {
            this.showBanner()
        }
    }

    this.hideBanner = function () {
        this.hide("cookie-banner")
    }

    this.showBanner = function () {
        this.show("cookie-banner")
    }

    this.addListener = function (name, event, callback) {
        var element = document.getElementById(name)
        if (element) {
            element.addEventListener("click", callback, false)
        }
    }

    this.cookiesAccepted = function () {
        this.hide("cookie-banner-unconfirm")
        this.show("cookie-accepted-confirm")

        this.storeCookiePolicy(true)
        this.storeSeenCookieMessage(true)
        this.setupGoogleAnalyticsTagIfOptedIn()
    }

    this.cookiesRejected = function () {
        this.hide("cookie-banner-unconfirm")
        this.show("cookie-rejected-confirm")

        this.storeCookiePolicy(false)
        this.storeSeenCookieMessage(true)
        this.deleteGoogleAnalyticsCookie()
        this.setupGoogleAnalyticsTagIfOptedIn()
    }

    this.hide = function (name) {
        var element = document.getElementById(name)
        if (element) {
            element.classList.add("govuk-visually-hidden")
        }
    }

    this.show = function (name) {
        var element = document.getElementById(name)
        if (element) {
            element.classList.remove("govuk-visually-hidden")
        }
    }

    this.storeCookiePolicy = function (usage) {
        this.createCookie("cookie_policy", JSON.stringify({
            "usage": usage
        }))
    }

    // Cookie
    this.createCookie = function (key, value, date) {
        var expiration = date
            ? new Date(date).toUTCString()
            : new Date(new Date().getTime() + (365 * 24 * 60 * 60 * 1000)).toUTCString()
        var cookie = escape(key) + "=" + escape(value) + ";expires=" + expiration + "; path=/"
        document.cookie = cookie
    }

    this.readCookie = function (name) {
        var key = name + "="
        var cookies = document.cookie.split(";")
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i]
            while (cookie.charAt(0) === " ") {
                cookie = unescape(cookie.substring(1, cookie.length))
            }
            if (cookie.indexOf(key) === 0) {
                return unescape(cookie.substring(key.length, cookie.length))
            }
        }
        return null
    }

    this.storeCookiePolicy = function (usage) {
        this.createCookie("cookie_policy", JSON.stringify({
            "usage": usage
        }))
    }

    this.storeSeenCookieMessage = function (seen) {
        var threeMonths = new Date();
        threeMonths.setMonth(threeMonths.getMonth() + 3);
        this.createCookie("seen_cookie_message", JSON.stringify({
            "seen": seen
        }), threeMonths.getTime())
    }

    this.cookieMessageSeen = function () {
      var seen_cookie_message_cookie = this.readCookie("seen_cookie_message");
      if (seen_cookie_message_cookie) {
        try {
          return JSON.parse(seen_cookie_message_cookie).seen;
        } catch (e) {
          return false;
        }
      }
    }

    this.deleteCookiePolicy = function () {
        this.createCookie("cookie_policy", "", new Date(1970, 1, 1))
    }

    this.retrieveCookiePolicy = function () {
        var cookiePolicy = this.readCookie("cookie_policy")
        if (cookiePolicy) {
            try {
                return JSON.parse(cookiePolicy)
            } catch (e) {
                console.log(e)
            }
        }
        return {
            "usage": false
        }
    }

    // Google Analytics
    this.gtag = function () {
        if (dataLayer) {
            dataLayer.push(arguments)
        }
    }

    this.isGoogleAnalyticsLoaded = function () {
        var scripts = document.getElementsByTagName("script")
        for (var i = 0; i < scripts.length; i++) {
            if (scripts[i].src === this._gaSrc) {
                return true
            }
        }
        return false
    }

    this.deleteGoogleAnalyticsCookie = function (key) {
        var expiration = new Date(2000, 1, 1)
        var cookie = escape(key) + "=;expires=" + expiration + "; path=/; domain=" + this._gaDomain + ";"
        document.cookie = cookie
    }

    this.clearGoogleAnalyticsCookies = function () {
        this.deleteGoogleAnalyticsCookie("_ga")
        this.deleteGoogleAnalyticsCookie("_gid")
        this.deleteGoogleAnalyticsCookie("_ga" + this._gaId.replace(/G-/g, "_"))
    }

    this.setupGoogleAnalyticsTagIfOptedIn = function () {
        var cookiePolicy = this.retrieveCookiePolicy()
        if (!cookiePolicy || !cookiePolicy.usage || this.isGoogleAnalyticsLoaded()) {
            return
        }

        window.dataLayer = window.dataLayer || []
        this.gtag("js", new Date())
        this.gtag("config", this._gaId)

        var head = document.getElementsByTagName("head")[0]
        var js = document.createElement("script")
        js.async = "true"
        js.src = this._gaSrc
        head.appendChild(js)
    }
  }
window.CookieConsent = new CookieConsent();