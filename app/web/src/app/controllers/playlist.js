import $ from 'jquery';
import PlaylistPlayer from '../services/playlistPlayer';

export default function PlaylistController(user) {

    var player = new PlaylistPlayer();
    player.getUserPlaylists(user);

    $('#playlist-title').empty().text(`${user}'s Public Playlists`);};