import {Component} from 'react'
import Loader from 'react-loader-spinner'
import Header from '../Header'

import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class Assessment extends Component {
  state = {
    assessmentQuestion: [],
    selectedNumberedQuestionIndex: 0,
    currentQuestionIndex: 0,
    answeredQuestionsCount: 0,
    unansweredQuestionsCount: 0,
    isClickedQuestionNumber: false,
    isCorrectOptionClicked: false,
    isAnyOptionClicked: false,
    selectedOption: '',
    score: 0,
    timer: 600,
    apiStatus: apiStatusConstants.initial,
    timeUp: true,
  }

  componentDidMount() {
    this.getData()
    this.startTimer()
  }

  getData = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const response = await fetch('https://apis.ccbp.in/assess/questions')
    const data = await response.json()
    // console.log(data);
    if (response.ok === true) {
      const updatedData = data.questions.map(eachQuestion => ({
        id: eachQuestion.id,
        optionsType: eachQuestion.options_type,
        questionText: eachQuestion.question_text,
        options: eachQuestion.options.map(eachOption => ({
          optionId: eachOption.id,
          text: eachOption.text,
          isCorrect: eachOption.is_correct,
          imageUrl: eachOption.image_url,
        })),
      }))
      this.setState({
        assessmentQuestion: updatedData,

        apiStatus: apiStatusConstants.success,
      })
      console.log(updatedData)
    } else {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  startTimer = () => {
    this.timerFunction = setInterval(() => {
      const {timer} = this.state
      if (timer > 0) {
        this.setState(prevState => ({timer: prevState.timer - 1}))
      } else {
        clearInterval(this.timerFunction)
        this.endAssessment()
        this.setState({timeUp: false})
      }
    }, 1000)
  }

  onClickRetryButton = () => {
    this.getData()
  }

  endAssessment = () => {
    const {history} = this.props
    const {timeUp} = this.state

    history.replace('/result', {timeUp})
    clearInterval(this.timerFunction)

    this.setState({
      timeUp: true,
    })
  }

  onSubmit = () => {
    const {history} = this.props
    const {score, timer} = this.state

    const minutes = Math.floor(timer / 60)
    const seconds = timer % 60
    const formattedTimer = `${minutes}:${
      seconds < 10 ? `0${seconds}` : seconds
    }`

    history.replace('/result', {score, formattedTimer})
    clearInterval(this.timer)
  }

  renderAssessmentFailure = () => (
    <div className="failure-container">
      <div className="failure-content-card">
        <img
          src="https://res.cloudinary.com/dzaz9bsnw/image/upload/v1704822095/Group_7519_ed27tg.jpg"
          alt="failure view"
          className="failure-image"
        />
        <h1 className="something-went-wrong">Oops! Something went wrong</h1>
        <p className="some-trouble">We are having some trouble</p>
        <button
          onClick={this.onClickRetryButton}
          className="retry-btn"
          type="button"
        >
          Retry
        </button>
      </div>
    </div>
  )

  renderLoader = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#263868" height={50} width={50} />
    </div>
  )

  renderAssessmentSuccess = () => {
    const {timer} = this.state
    const hours = Math.floor(timer / 3600)
    const minutes = Math.floor(timer / 60)
    const seconds = timer % 60
    const formattedTimer = `${hours
      .toString()
      .padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

    return (
      <div className="assessment-main-container">
        <div className="assessment-questions-container">
          {this.renderQuestion()}
        </div>
        <div className="summary-timer-container">
          <div className="timer-container">
            <p className="time-heading">Time Left</p>
            <p className="timer">{formattedTimer}</p>
          </div>
          <div className="assessment-summary-container">
            {this.renderAssessmentSummary()}
          </div>
        </div>
      </div>
    )
  }

  renderAssessmentDetails = () => {
    const {apiStatus} = this.state
    console.log(apiStatus)
    switch (apiStatus) {
      case apiStatusConstants.success:
        return this.renderAssessmentSuccess()
      case apiStatusConstants.failure:
        return this.renderAssessmentFailure()
      case apiStatusConstants.inProgress:
        return this.renderLoader()
      default:
        return null
    }
  }

  onClickSummaryButton = id => {
    const {assessmentQuestion} = this.state
    const selectedQuestionData = assessmentQuestion.findIndex(
      item => item.id === id,
    )
    console.log(selectedQuestionData)
    this.setState({
      selectedNumberedQuestionIndex: selectedQuestionData,
      currentQuestionIndex: selectedQuestionData,
      isClickedQuestionNumber: true,
    })
    // if (isCorrectOptionClicked) {
    //   this.setState((prevState) => ({
    //     score: prevState.score + 1,
    //   }));
    // }
  }

  onClickAnswer = id => {
    const {
      assessmentQuestion,
      currentQuestionIndex,
      selectedOption,
      isCorrectOptionClicked,
    } = this.state

    const currentQuestion = assessmentQuestion[currentQuestionIndex]
    const selectedOptionData = currentQuestion.options.find(
      item => item.optionId === id,
    )

    if (!isCorrectOptionClicked && selectedOptionData.isCorrect === 'true') {
      this.setState(prevState => ({
        //   score: prevState.score + 1,
        isCorrectOptionClicked: true,
      }))
    } else {
      this.setState({
        isAnyOptionClicked: true,
      })
    }

    this.setState({selectedOption: id})
  }

  handleOnClickNextBtn = () => {
    const {
      currentQuestionIndex,
      assessmentQuestion,
      isCorrectOptionClicked,
      isAnyOptionClicked,
    } = this.state
    if (currentQuestionIndex < assessmentQuestion.length - 1) {
      this.setState(prevState => ({
        currentQuestionIndex: prevState.currentQuestionIndex + 1,
        isClickedQuestionNumber: false,
      }))
    }
    if (isCorrectOptionClicked || isAnyOptionClicked) {
      this.setState(prevState => ({
        answeredQuestionsCount: prevState.answeredQuestionsCount + 1,
        isCorrectOptionClicked: false,
        isAnyOptionClicked: false,
      }))
    }
    this.setState(prevState => ({
      score: isCorrectOptionClicked ? prevState.score + 1 : prevState.score,
    }))
  }

  renderAssessmentSummary = () => {
    const {answeredQuestionsCount, assessmentQuestion} = this.state
    return (
      <div className="assessment-summary">
        <div className="answered-unanswered-card">
          <p className="answered">
            <span className="answered-span">{answeredQuestionsCount}</span>{' '}
            Answered Questions
          </p>
          <p className="unanswered">
            <span className="unanswered-span">
              {' '}
              {assessmentQuestion.length - answeredQuestionsCount}
            </span>{' '}
            Unanswered Questions
          </p>
        </div>
        <hr className="summary-horizontal-line" />
        <div className="question-submit-btn-card">
          <div>
            <h1 className="question-number-heading">
              Questions ({assessmentQuestion.length})
            </h1>
            <ul className="question-number-card">
              {assessmentQuestion.map((item, index) => (
                <button
                  type="button"
                  className="question-number"
                  onClick={() => this.onClickSummaryButton(item.id)}
                  key={item.id}
                >
                  {index + 1}
                </button>
              ))}
            </ul>
          </div>
          <button onClick={this.onSubmit} type="button" className="submit-btn">
            Submit Assessment
          </button>
        </div>
      </div>
    )
  }

  renderQuestion = () => {
    const {
      assessmentQuestion,
      currentQuestionIndex,
      selectedNumberedQuestionIndex,
      isClickedQuestionNumber,
      isCorrectOptionClicked,
      selectedOption,
      score,
    } = this.state

    console.log(isCorrectOptionClicked)
    console.log(selectedOption)
    const currentQuestion =
      assessmentQuestion[
        isClickedQuestionNumber
          ? selectedNumberedQuestionIndex
          : currentQuestionIndex
      ]
    const questionNumber = isClickedQuestionNumber
      ? selectedNumberedQuestionIndex
      : currentQuestionIndex

    const {questionText, options, optionsType} = currentQuestion

    return (
      <div className="question-main-container">
        <h1 className="question-text">
          {questionNumber + 1}. {questionText}
        </h1>
        <hr className="horizontal-line" />
        {optionsType === 'DEFAULT' && (
          <div className="option-container">
            {options.map(option => (
              <button
                type="button"
                className={
                  selectedOption === option.optionId ? 'selected' : 'normal'
                }
                onClick={() => this.onClickAnswer(option.optionId)}
                key={option.optionId}
              >
                {option.text}
              </button>
            ))}
          </div>
        )}
        {optionsType === 'IMAGE' && (
          <div className="option-container">
            {options.map(option => (
              <img
                className={
                  selectedOption === option.optionId
                    ? 'selectedImg'
                    : 'normalImg'
                }
                onClick={() => this.onClickAnswer(option.optionId)}
                key={option.optionId}
                src={option.imageUrl}
                alt=""
              />
            ))}
          </div>
        )}
        {optionsType === 'SINGLE_SELECT' && (
          <div className="mini-card">
            <select
              className="select-card"
              onChange={e => this.onClickAnswer(e.target.value)}
            >
              {options.map(option => (
                <option
                  className={
                    selectedOption === option.optionId
                      ? 'selectedOption'
                      : 'normalOption'
                  }
                  value={option.optionId}
                  key={option.optionId}
                >
                  {option.text}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="btn-card">
          <p>{score}</p>
          <button
            type="button"
            className="nxt-button"
            onClick={this.handleOnClickNextBtn}
          >
            Next
          </button>
        </div>
      </div>
    )
  }

  render() {
    return (
      <>
        <Header />
        {this.renderAssessmentDetails()}
      </>
    )
  }
}

export default Assessment
