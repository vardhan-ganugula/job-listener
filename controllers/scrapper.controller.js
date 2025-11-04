
class Scrapper{
    constructor(){
        this.domins = ['']
        this.linkedinURL = 'https://www.linkedin.com/jobs/search-results/'
    }
    searchJobs(){
        return this.__makeLinkedinURL()
    }
    __makeLinkedinURL(keyword, location, experienceLevel, remote, jobType, easyApply, time=4400){
        let linkedinURL = this.linkedinURL + '?f_TPR=' + time;
        
        if(keyword){
            linkedinURL += `&keywords=${keyword}`
        }

        if(location){
            linkedinURL += `&location=${location}`
        }
        if (experienceLevel !== '') {
            const transformExperience = experienceLevel.split(',').map((exp) => {
                switch (exp.trim().toLowerCase()) {
                    case 'internship': return 1;
                    case 'entry level': return 2;
                    case 'associate': return 3;
                    case 'mid-senior level': return 4;
                    case 'director' : return 5;
                    case 'executive' : return 6;
                    default : return '';
                }
            }).filter(Boolean);

            linkedinURL += `&f_E=${transformExperience.join(',')}`
        }
        if(remote.length !== 0){
            const transformedRemote = remote.split(',').map((e) => {
                switch(e.trim()){
                    case 'Remote' : return "2";
                    case "Hybrid" : return "3";
                    case "On-Site" : return "1";
                    default : return ""
                }
            }).filter(Boolean);

            linkedinURL += `&f_WT=${transformedRemote.join(',')}`
        }
        if(jobType !== ''){
            const transformedJobType = jobType.split(',').map((type) => type.trim().charAt(0).toUpperCase());

            linkedinURL += `&f_JT=${transformedJobType.join(',')}`
        }
        if(easyApply !== ''){
            linkedinURL += `&f_EA=true`
        }
        return linkedinURL;
    }
}

export default Scrapper;