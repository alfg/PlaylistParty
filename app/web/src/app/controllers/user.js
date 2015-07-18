import PlaylistPlayer from '../services/playlistPlayer';

export default function UserController(user) {

    var player = new PlaylistPlayer();
    player.getUserPlaylists(user);

};