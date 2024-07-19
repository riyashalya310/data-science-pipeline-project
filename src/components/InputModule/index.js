import Header from '../Footer'
import Footer from '../Header'
import './index.css'

const InputModule = () => {
    return (
        <>
        <Header/>
            <div id="container" className="container-fluid" style={{scrollBehavior: "smooth"}}>
                <div className="row">
                    <div className="col-12">
                        <h1>Problem Identification: Study of change of climate on the rabi crops over different regions and states of India</h1>
                        <h1>Factors involved: </h1>
                        <ol>
                            <li>To identify the effect of greenhouse gases such as increasing C02 levels on global warming and in turn on weather</li>
                            <li>To identify decline of trees which increases soil erosion and thus increases chances of floods and droughts</li>
                            <li>To identify the effect of increase in temparatures on the decrease in level of moisture in soil</li>
                            <li>To identify if proper amount of rainfall (50-75 cm) received during the season</li>
                            <li>To identify if proper sunlight received during months of ripening( April to June)</li>
                            <li>To identify if crop cultivation areas are increased or decreased during last ten years</li>
                            <li>To identify if the rainfall season has properly occurred in the respective states and in respective months</li>
                            <li>To identify the increase in  average temparatures in the summer and winter season in respective states</li>
                            <li>to identify the unseasonal rainfalls and their effects on the crops yield</li>
                            <li>To identify the increase in ocean water level due to rise in global warming</li>
                            <li>To identify the effect of insufficient groundwater recharge due to low rainfall</li>
                            <li>To identify if proper Precipitation received during whole season</li>
                        </ol>
                        <h2>Upload CSV File</h2>
                        <form id="myForm" method="post" enctype="multipart/form-data" className="mb-2">
                            <div className="col-12" id="formFile">
                                <div>
                                    <div id="label"></div>
                                    <div className="btn"></div>
                                    <div id="helpText"></div>
                                </div>
                            </div>
                            <div id="btnContainer">
                                <button type="submit" className="btn btn-primary">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Footer/>
        </>
    )
}

export default InputModule