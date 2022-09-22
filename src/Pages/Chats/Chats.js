import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import APIUrlConstants from '../../Config/APIUrlConstants';
import { fetchCall } from '../../Services/APIService';
import { apiMethods, gaEvents, httpStatusCode } from '../../Constants/TextConstants';
import { hidefcWidget, preSetupFCWidget } from './FreshChat';
import { userRoleId } from '../../Utilities/AppUtilities';
import './Chats.css';
import Loading from '../Widgets/Loading';
import { Button } from 'react-bootstrap';
import useAnalyticsEventTracker from '../../Hooks/useAnalyticsEventTracker';

export default function Chats() {
  const location = useLocation();
  const [snackBar, setSnackBar] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [size, setSize] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(location.state != null ? location.state.showLoader : true);
  const roledId = localStorage.getItem('roleId');
  const { buttonTracker } = useAnalyticsEventTracker();
  const videoRef = useRef(null);

  useEffect(() => {
    if (roledId === userRoleId.remoteSmartUser) {
      preSetupFCWidget(true).then();
    }

    if (isLoading) {
      setTimeout(() => {
        setIsLoading(false);
      }, 7000);
    }

    if (localStorage.getItem('contactSales') === 'true') {
      setSnackBar(true);
    }
  }, [isLoading, roledId]);
  /* Component cleanup function call start  */
  useEffect(
    () => () => {
      hidefcWidget().then();
    },
    [],
  );


  const vid = document.getElementById("demoVideo");
  const videoLength = vid?.duration

  const handleClick = async () => {
    const [statusCode] = await fetchCall(APIUrlConstants.CONTACT_SALES + '/' + localStorage.getItem('id'), apiMethods.POST, {});
    if (statusCode === httpStatusCode.SUCCESS) {
      setSnackBar(true);
      localStorage.setItem('contactSales', 'true');
    }
  };

  const minutes = parseInt(videoLength / 60, 10);
  const seconds = parseInt(videoLength % 60, 10);

  const time = minutes + ':' + seconds

  const videoHandler = (control) => {
    if (control === "play") {
      videoRef.current.play();
      setPlaying(true);

    } else if (control === "pause") {
      videoRef.current.pause();
      setPlaying(false);

    }
  };


  const fastForward = () => {
    videoRef.current.currentTime += 5;
  };

  const revert = () => {
    videoRef.current.currentTime -= 5;
  };

  setInterval(() => {
    setCurrentTime(videoRef.current?.currentTime);
    setProgress((videoRef.current.currentTime / videoLength) * 100);
  }, 1000);

  const setVolume = (volumeValue) => {
    videoRef.current.volume = (volumeValue / 100);
  }

  useEffect(() => {
    if (currentTime === videoLength) {
      setPlaying(false);
    }
  },
    [currentTime]
  )
  const setPlayBack = (speed) => {
    videoRef.current.playbackRate = speed;
  };

  return (
    <div className="wrapperBase">
      {isLoading && <Loading />}
      {roledId !== userRoleId.remoteSmartUser && (
        <div className="wrapperCard">
          <div className="wrapperCard--header">
            <div className="titleHeader">
              <div className="info">
                <h6>Chat Demo</h6>
              </div>
            </div>
          </div>
          <div className="wrapperCard--body">
            <div className={size ? 'fullScreen' : 'videoWrapper'}>
              <video className='videoSize' onCanPlay={setPlayBack} ref={videoRef} id="demoVideo">
                <source src="https://signet-group-public.s3.amazonaws.com/Animate+-+22182.mp4" />
              </video>
              <div className='controlWrapper'>
                <p style={{ color: 'white', fontSize: '36px' }}>Chat Demo</p>
              </div>
              <div className={size ? 'fullScreen_bottomControl' : 'bottomControl'}>

                <div>
                  <input style={{ width: size ? '95%' : "657.61px" }} type="range" min='0' max='100' step='1' value={progress === 'NaN:NaN' ? '0' : progress} />
                </div>

                <div className='row control'>
                  <div className='col-4'>
                    <img className='volumeIcon' src="/images/video/volume-icon.svg" alt='volume' />
                    <div className='volumeBar'>
                      <input id="vol-control" type="range" min="0" max="100" step="1" onInput={(e) => setVolume(e.target.value)} onChange={(e) => setVolume(e.target.value)} />
                    </div>
                  </div>
                  <div className='col-6'>
                    <div className='row'>
                      <div className='col-2'>
                        <p style={{ color: 'white' }}>
                          {Math.floor(currentTime / 60) + ":" + ("0" + Math.floor(currentTime % 60)).slice(-2)}
                        </p>
                      </div>
                      <div className='col-7'>
                        <div className="controle">
                          <img onClick={revert} className="backword" alt="backward" src="/images/video/icons8-wrewind.png" />
                          {playing ? (
                            <img onClick={() => videoHandler("pause")} className="controlsIcon--small" alt="pause" src="/images/video/icons8-wpause.png" />
                          ) : (
                            <img onClick={() => videoHandler("play")} className="controlsIcon--small" alt="play" src="/images/video/icons8-wplay.png" />
                          )}
                          <img onClick={fastForward} className="forward" alt="forward" src="/images/video/icons8-wfastforward.png" />
                        </div>
                      </div>
                      <div className='col-2'>
                        <p style={{ color: 'white' }}>{time === 'NaN:NaN' ? '00:00' : time}</p>
                      </div>
                    </div>
                  </div>
                  <div className='col-2'>
                    <div >
                      <div className='setting'>
                        <img src="/images/video/settings.svg" alt='setting' />
                        <div className="dropup-content">
                          <Button className='speedSetting' variant='link' onClick={() => setPlayBack(0.5)}>0.5</Button>
                          <Button className='speedSetting' variant='link' onClick={() => setPlayBack(1)}>1</Button>
                          <Button className='speedSetting' variant='link' onClick={() => setPlayBack(1.5)}>1.5</Button>
                          <Button className='speedSetting' variant='link' onClick={() => setPlayBack(2)}>2</Button>
                        </div>
                      </div>

                      <img onClick={() => size ? setSize(false) : setSize(true)} alt='fullscreen' src="/images/video/icons8-full-screen.png" />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {!snackBar && (
              <Button
                className="buttonPrimary mb-5"
                onClick={() => {
                  buttonTracker(gaEvents.CONTACT_SALES);
                  handleClick();
                }}
              >
                Contact Sales
              </Button>
            )}
          </div>
          {snackBar && <div className="contactSalesText">Thank you for your interest. We will be contacting you soon</div>}
        </div>
      )}
    </div>
  );
}
