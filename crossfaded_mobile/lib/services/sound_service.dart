import 'dart:async';
import 'package:flutter/services.dart';
import 'package:audioplayers/audioplayers.dart';

class SoundService {
  static final AudioPlayer _player = AudioPlayer();
  static bool _isRinging = false;
  static Timer? _ringVibrateTimer;

  static bool get isRinging => _isRinging;

  /// Continuous loud ring for Admin when a new order arrives
  static Future<void> startOrderAlarm() async {
    if (_isRinging) return;
    _isRinging = true;

    try {
      await _player.setReleaseMode(ReleaseMode.loop);
      await _player.setVolume(1.0);
      await _player.play(UrlSource('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'));
    } catch (_) {}

    // Pulsing heavy haptics and system alert sound
    _ringVibrateTimer?.cancel();
    _ringVibrateTimer = Timer.periodic(const Duration(milliseconds: 900), (_) async {
      if (!_isRinging) {
        _ringVibrateTimer?.cancel();
        return;
      }
      try {
        await HapticFeedback.heavyImpact();
        await SystemSound.play(SystemSoundType.alert);
      } catch (_) {}
    });
  }

  /// Stop ringing
  static Future<void> stopAlarm() async {
    _isRinging = false;
    _ringVibrateTimer?.cancel();
    _ringVibrateTimer = null;
    try {
      await _player.stop();
    } catch (_) {}
  }

  /// Pleasant notification chime when order status updates
  static Future<void> playNotificationChime() async {
    try {
      await HapticFeedback.mediumImpact();
      await SystemSound.play(SystemSoundType.alert);

      final chimePlayer = AudioPlayer();
      await chimePlayer.setVolume(0.9);
      await chimePlayer.play(UrlSource('https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3'));
    } catch (_) {}
  }
}
