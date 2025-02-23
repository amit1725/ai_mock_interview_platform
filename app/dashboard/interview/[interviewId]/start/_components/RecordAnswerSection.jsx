"use client"

import Webcam from 'react-webcam'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import useSpeechToText from 'react-hook-speech-to-text'
import { Mic, StopCircle } from 'lucide-react'
import { toast } from 'sonner'
import { chatSession } from '@/utils/GeminiAIModel'
import { UserAnswer } from '@/utils/schema'
import { useUser } from '@clerk/nextjs'
import moment from 'moment'
import { db } from '@/utils/db'

const RecordAnswerSection = ({ mockInterviewQuestion,activeQuestionIndex, interviewData }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const {user} = useUser();
  const [loading,setLoading] = useState(false);

  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    setResults,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false
  });

  useEffect(() => {
    if (results.length > 0) {
      const combinedResults = results.reduce((acc, result) => acc + result.transcript, '');
      setUserAnswer(prevAns => prevAns + combinedResults);
    }
  }, [results]);

  useEffect(()=>{
    if(!isRecording && userAnswer.length>10){
      UpdateUserAnswer();
    }
  },[userAnswer])

  const StartStopRecording = async() => {
    if (isRecording) {
      stopSpeechToText();
    } else {
      startSpeechToText();
    }
  };

  const UpdateUserAnswer=async()=>{
    setLoading(true);
    const feedbackPrompt = 'Question: ' + mockInterviewQuestion[activeQuestionIndex]?.question + ", User Answer:"+userAnswer+",Depends on question and user answer for given interview question"
    +" please give us rating between 1 to 10 for answer and feedback as area of improvement if any"+
    "in just 3-5 lines to improve it in JSON format with rating field and feedback field";
    console.log(feedbackPrompt); // Save or handle feedbackPrompt here
    const result = await chatSession.sendMessage(feedbackPrompt);
    const mockJsonResp=(result.response.text()).replace('```json','').replace('```','')
    console.log(mockJsonResp);
    const JsonFeedbackResp = JSON.parse(mockJsonResp);
    const resp = await db.insert(UserAnswer)
    .values({
      mockIdRef:interviewData?.mockId,
      question:mockInterviewQuestion[activeQuestionIndex]?.question,
      correctAns:mockInterviewQuestion[activeQuestionIndex]?.answer,
      userAns:userAnswer,
      feedback:JsonFeedbackResp?.feedback,
      rating:JsonFeedbackResp?.rating,
      userEmail: user?.primaryEmailAddress.emailAddress,
      createdAt:moment().format('DD-MM-yyyy')
    })
    if(resp){
      toast('User Answer recorded successfully');
      setResults([]);
      setUserAnswer('');
    }
    setUserAnswer('');
    setResults([]);
    setLoading(false);
  }

  if (error) return <p>Web Speech API is not available in this browser 🤷‍</p>;

  return (
    <div className='flex flex-col justify-center items-center'>
      <div className='flex flex-col mt-20 justify-center items-center rounded-lg p-5 bg-black'>
        <Image src={'/webcam.png'} width={200} height={200} className='absolute bg-transparent' />
        <Webcam
          mirrored={true}
          style={{
            height: 300,
            width: '100%',
            zIndex: 10
          }}
        />
      </div>
      <Button disabled={loading} variant="outline" className="my-10" onClick={StartStopRecording}>
        {isRecording ?
          <h2 className='text-red-600 flex gap-2'>
            <StopCircle/> Recording
          </h2>
          :<h2 className='flex gap-2 items-center text-primary'><Mic/>Record Answer</h2>
        }
      </Button>
    </div>
  );
}

export default RecordAnswerSection;
