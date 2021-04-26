import Image from 'next/image';
import { useContext, useEffect, useRef, useState } from 'react';
import { PlayerContext } from '../../contexts/PlayerContext';
import styles from './styles.module.scss';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player() {

    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress,setProgress] = useState(0);

    const { 
        episodeList, 
        currentEpisodeIndex, 
        isPlaying,
        togglePlay,
        setPlayingState,
        playNext,
        playPrevious,
        hasNext,
        hasPrevious,
        isLooping,
        toggleLooping,
        isShuffling,
        toggleShuffle,
        clearPlayerState
    } = useContext(PlayerContext);

    useEffect(() => {
        if (!audioRef.current) {
            return;
        }
        if (isPlaying) {
            audioRef.current.play();
        }
        else {
            audioRef.current.pause();
        }
    }, [isPlaying])
    function setupProgressListener(){
        audioRef.current.currentTime = 0;
        audioRef.current.addEventListener('timeupdate',()=>{
            setProgress(Math.floor(audioRef.current.currentTime))
        })
    }
    function handleSeek(amount:number){
        audioRef.current.currentTime = amount;
        setProgress(amount);
    }
    function handleEpisodeEnded(){
        if(hasNext){
            playNext()
        }
        else{
            clearPlayerState();
        }
    }
    const episode = episodeList[currentEpisodeIndex];

    return (
        <div className={styles.playerContainer}>
            <header>
                <img src="/playing.svg" alt="tocando agora" />
                <strong>Tocando Agora</strong>
            </header>
            { episode ? (
                <div className={styles.currenEpisode}>
                    <Image width={592} height={592}
                        src={episode.thumbnail}
                        alt='imagem do episodio'
                        objectFit='cover'
                    />
                    <strong>{episode.title}</strong>
                    <span>{episode.members}</span>
                </div>
            ) : (
                <div className={styles.emptyPlayer}>
                    <strong>Selecione um podcast para ouvir.</strong>

                </div>
            )}
            <footer className={!episode ? styles.empty : ''}>
                <div className={styles.progress}>
                    <span>{convertDurationToTimeString(progress)}</span>
                    <div className={styles.slider}>
                        {episode ?
                            (
                                <Slider
                                    trackStyle={{ backgroundColor: '#04d361' }}
                                    railStyle={{ backgroundColor: '#9f75ff' }}
                                    value={progress}
                                    max={episode.duration}
                                    onChange={handleSeek}
                                    handleStyle={{ borderColor: 'white', borderWidth: '4px' }}
                                />
                            ) :
                            (
                                <div className={styles.emptySlider}></div>
                            )
                        }
                    </div>
                    <span>{convertDurationToTimeString(episode?.duration??0)}</span>
                </div>
                {episode &&
                    (
                        <audio src={episode.url}
                            ref={audioRef}
                            onPlay={()=>setPlayingState(true)}
                            onPause={()=>setPlayingState(false)}
                            loop={isLooping}
                            autoPlay
                            onEnded={handleEpisodeEnded}
                            onLoadedMetadata={setupProgressListener}
                        />
                    )
                }
                <div className={styles.buttons}>
                    <button type='button' onClick={toggleShuffle} className={isShuffling ? styles.isActive:''} disabled={!episode || episodeList.length===1} >
                        <img src="/shuffle.svg" alt="Embaralhar" />
                    </button>
                    <button type='button' onClick={playPrevious} disabled={!episode||!hasPrevious}>
                        <img src="/play-previous.svg" alt="Tocar Anterior" />
                    </button>

                    <button type='button' disabled={!episode} onClick={togglePlay} className={styles.playButton}>
                        {
                            isPlaying
                                ? <img src="/pause.svg" alt="Pausar" />
                                : <img src="/play.svg" alt="Tocar" />
                        }
                    </button>

                    <button type='button' onClick={playNext} disabled={!episode||!hasNext}>
                        <img src="/play-next.svg" alt="Tocar proximo" />
                    </button>

                    <button type='button' onClick={toggleLooping} className={isLooping ? styles.isActive:''} disabled={!episode}>
                        <img src="/repeat.svg" alt="Repetir" />
                    </button>

                </div>

            </footer>
        </div >
    )
}