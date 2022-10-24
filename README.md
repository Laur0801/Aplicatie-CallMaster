
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
# Zyvo


Zyvo is a dead simple asterisk configuration interface, it's not meant to be a replacement for freepbx or the likes but it's simple and feature complete enough to use for SOHO (Small Office/Home Office) purposes.

![screenshot](https://i.imgur.com/g36PsiU.png)
Zyvo assumes a green-field install and will **overwrite** any and all existing configuration in the files sip.conf, extensions.conf and queues.conf. Zyvo also uses chan_sip instead of pjsip.

## Prerequisites

You're gonna need to install node.js and npm along with asterisk for everything to work smoothly

You also need the following command line tools 

* lame
* sox

You can install those on debian based distro's with 
```
apt-get install sox lame
```

## Install
Zyvo was made primarily for linux/BSD based distro's but could be modified to work with any operating system of your choice that runs asterisk.

To install clone the directory first git clone the repo and then run npm install to install all the dependencies.

```
git clone https://github.com/AlchemillaHQ/zyvo
npm install
```

Start the application with
```
npm run start
```

To add your own custom configuration to asterisk please edit the files given below

`sip_zyvo_user.conf` in place of sip.conf

`extensions_zyvo_user.conf` in place of extensions.conf

`queues_zyvo_user.conf` instead of queues.conf 

You will be able to edit these files in the advanced section as well.

### Todo
- [x] Queues
- [x] Extensions
- [x] Trunks
- [x] IVR
- [ ] Refactor

### Warning
This is very early software that we unironically wrote in a weekend. Some features are still being implemented and worked on, things may change dramatically over time so please proceed with caution.

#### Credits

[JustBoil.me](https://justboil.me/) for the awesome tailwind panel
