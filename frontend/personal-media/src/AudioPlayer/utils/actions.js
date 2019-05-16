import Player from "./constants";

export const playAudio = player => {
    if (player) {
        let playStatus = null;

        if (player.paused) {
            player.play();
            playStatus = Player.Status.PLAY;
        } else {
            player.pause();
            playStatus = Player.Status.PAUSE;
        }

        return { playStatus };
    }

    return null;
};

export const muteAudio = player => {
    if (player) {
        let muteStatus = null;

        if (player.muted) {
            player.muted = false;
            muteStatus = Player.Status.UNMUTE;
        } else {
            player.muted = true;
            muteStatus = Player.Status.MUTE;
        }

        return { muteStatus };
    }

    return null;
};

export const getPlayerStateFromAction = (player, action) => {
    let newState = null;

    switch (action) {
        case Player.Status.MUTE:
            newState = muteAudio(player);
            break;
        case Player.Status.PLAY:
        default:
            newState = playAudio(player);
            break;
    }

    return newState;
};