import $ from 'jquery';
import _ from 'lodash';

import { castApplicationId, castNamespace } from '../../../../../config.js';

export default class CastReceiver {
  constructor(options) {

    this._namespace = castNamespace || 'urn:x-cast:com.google.cast.spotlist';

    this._defaults = {
      player: {
        quality: 'default',
        controls: 0
      }
    };
    this._options = $.extend(true, {}, this._defaults, options);

    this._player = window._player;
    this._castReceiverManager = null;
    this._messageBus = null;

    this.init();
  }

  init() {
    var self = this;

    this.youTubeLoadPlayer(); // Loads Youtube iFrame Player.

    cast.receiver.logger.setLevelValue(0);

    self._castReceiverManager = cast.receiver.CastReceiverManager.getInstance();
    console.log('Starting Receiver Manager');

    self._castReceiverManager.onReady = self.receiverManager_onReady.bind(this);
    self._castReceiverManager.onSenderConnected = self.receiverManager_onSenderConnected.bind(this);
    self._castReceiverManager.onSenderDisconnected = self.receiverManager_onSenderDisconnected.bind(this);
    self._castReceiverManager.onSystemVolumeChanged = self.receiverManager_onSystemVolumeChanged.bind(this);

    // create a CastMessageBus to handle messages for a custom namespace
    self._messageBus = self._castReceiverManager.getCastMessageBus(self._namespace);
    self._messageBus.onMessage = self.messageBus_onMessage.bind(this);

    // initialize the CastReceiverManager with an application status message
    self._castReceiverManager.start({statusText: "Application is starting"});
    console.log('Receiver Manager started');
  }

  cast() {

  }

  receiverManager_onReady(event) {
    var self = this;
    console.log('Received Ready event: ' + JSON.stringify(event.data));
    self._castReceiverManager.setApplicationState("Application status is ready...");

    $('#splash').fadeOut();
    $('#player').fadeIn();
  }

  receiverManager_onSenderConnected(event) {
    var self = this;
    console.log('Received Sender Connected event: ' + event.data);
    console.log(self._castReceiverManager.getSender(event.data).userAgent);
  }

  receiverManager_onSenderDisconnected(event) {
    var self = this;
    console.log('Received Sender Disconnected event: ' + event.data);
    if (self._castReceiverManager.getSenders().length == 0) {
      window.close();
    }
  }

  receiverManager_onSystemVolumeChanged(event) {
    var self = this;
    console.log('Received System Volume Changed event: ' + event.data['level'] + ' ' + event.data['muted']);
  }

  messageBus_onMessage(event) {
    var self = this;
    console.log('Message [' + event.senderId + ']: ' + event.data);
    // display the message from the sender
    //displayText(event.data);

    console.log(event);

    self._player.loadPlaylist(JSON.parse(event.data), 0, 5, self._options.player.quality);
    // inform all senders on the CastMessageBus of the incoming message event
    // sender message listener will be invoked
    self._messageBus.send(event.senderId, event.data);
  }

  player_Ready(e) {
    var self = this;

    this._player = window._player;
    //this._player.setVolume(0);
  }

  youTubeLoadPlayer() {

    var self = this;
    // Setup ready event callback for YouTube iframe API.
    window.onYouTubeIframeAPIReady = function() { self.youTube_IframeAPIReady(self._options); };

    // Load the YouTube Iframe API.
    var $script = $('<script />', {
      src: 'https://www.youtube.com/iframe_api'
    });

    $('script')
    .first()
    .before($script)
    ;
  }

  youTube_IframeAPIReady(options) {
    var self = this;

    window._player = new YT.Player('player', {

      playerVars: {
        controls: 0,
        autoplay: 1,
        iv_load_policy: 3,
        modestbranding: 0,
        showinfo:  1
      },

      events: {
        'onReady': function() { self.player_Ready() },
        'onStateChange': this.player_StateChange
      }
    });
  }
}
