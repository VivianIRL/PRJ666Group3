import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useNavigate } from 'react-router-dom';

function ImmigrationDetails() {
    const navigate = useNavigate()

    function handleRegister(e) {
        e.preventDefault();
        navigate('/');
    }

    const acceptedCountries = [
        'Afghanistan',
        'Albania',
        'Algeria',
        'Andorra',
        'Angola',
        'Antigua and Barbuda',
        'Argentina',
        'Armenia',
        'Australia',
        'Austria',
        'Azerbaijan',
        'Bahrain',
        'Bangladesh',
        'Barbados',
        'Belarus',
        'Belgium',
        'Belize',
        'Benin',
        'Bhutan',
        'Bolivia',
        'Bosnia and Herzegovina',
        'Botswana',
        'Brazil',
        'Brunei',
        'Bulgaria',
        'Burkina Faso',
        'Burundi',
        'Cambodia',
        'Cameroon',
        'Canada',
        'Cape Verde',
        'Central African Republic',
        'Chad',
        'Chile',
        'China',
        'Colombia',
        'Comoros',
        'Congo',
        'Congo (Democratic Republic)',
        'Costa Rica',
        'Croatia',
        'Cuba',
        'Cyprus',
        'Czechia',
        'Denmark',
        'Djibouti',
        'Dominica',
        'Dominican Republic',
        'East Timor',
        'Ecuador',
        'Egypt',
        'El Salvador',
        'Equatorial Guinea',
        'Eritrea',
        'Estonia',
        'Eswatini',
        'Ethiopia',
        'Fiji',
        'Finland',
        'France',
        'Gabon',
        'Georgia',
        'Germany',
        'Ghana',
        'Greece',
        'Grenada',
        'Guatemala',
        'Guinea',
        'Guinea-Bissau',
        'Guyana',
        'Haiti',
        'Honduras',
        'Hungary',
        'Iceland',
        'India',
        'Indonesia',
        'Iran',
        'Iraq',
        'Ireland',
        'Israel',
        'Italy',
        'Ivory Coast',
        'Jamaica',
        'Japan',
        'Jordan',
        'Kazakhstan',
        'Kenya',
        'Kiribati',
        'Kosovo',
        'Kuwait',
        'Kyrgyzstan',
        'Laos',
        'Latvia',
        'Lebanon',
        'Lesotho',
        'Liberia',
        'Libya',
        'Liechtenstein',
        'Lithuania',
        'Luxembourg',
        'Madagascar',
        'Malawi',
        'Malaysia',
        'Maldives',
        'Mali',
        'Malta',
        'Marshall Islands',
        'Mauritania',
        'Mauritius',
        'Mexico',
        'Federated States of Micronesia',
        'Moldova',
        'Monaco',
        'Mongolia',
        'Montenegro',
        'Morocco',
        'Mozambique',
        'Myanmar (Burma)',
        'Namibia',
        'Nauru',
        'Nepal',
        'Netherlands',
        'New Zealand',
        'Nicaragua',
        'Niger',
        'Nigeria',
        'North Korea',
        'North Macedonia',
        'Norway',
        'Oman',
        'Pakistan',
        'Palau',
        'Palestine',
        'Panama',
        'Papua New Guinea',
        'Paraguay',
        'Peru',
        'Philippines',
        'Poland',
        'Portugal',
        'Qatar',
        'Romania',
        'Russia',
        'Rwanda',
        'St Kitts and Nevis',
        'St Lucia',
        'St Vincent',
        'Samoa',
        'San Marino',
        'Sao Tome and Principe',
        'Saudi Arabia',
        'Senegal',
        'Serbia',
        'Seychelles',
        'Sierra Leone',
        'Singapore',
        'Slovakia',
        'Slovenia',
        'Solomon Islands',
        'Somalia',
        'South Africa',
        'South Korea',
        'South Sudan',
        'Spain',
        'Sri Lanka',
        'Sudan',
        'Suriname',
        'Sweden',
        'Switzerland',
        'Syria',
        'Tajikistan',
        'Tanzania',
        'Thailand',
        'The Bahamas',
        'The Gambia',
        'Togo',
        'Tonga',
        'Trinidad and Tobago',
        'Tunisia',
        'Turkey',
        'Turkmenistan',
        'Tuvalu',
        'Uganda',
        'Ukraine',
        'United Arab Emirates',
        'United Kingdom',
        'United States',
        'Uruguay',
        'Uzbekistan',
        'Vanuatu',
        'Vatican City',
        'Venezuela',
        'Vietnam',
        'Yemen',
        'Zambia',
        'Zimbabwe',
    ]

    const acceptedProvinces = [
        'Ontario',
        'Quebec',
        'Nova Scotia',
        'New Brunswick',
        'Manitoba',
        'British Columbia',
        'Prince Edward Island',
        'Saskatchewan',
        'Alberta',
        'Newfoundland and Labrador'
    ]

    return (
        <>
            <h2 style={{ 'marginTop': "67px", 'display': "flex", 'paddingLeft': "50px", }}><b>Immigration Details</b></h2>
            
            <Form>
                <div className="row" style={{'marginTop': "67px", 'paddingLeft': "50px",  'paddingRight': "50px", "gap": "20%" }}>
                    <div className="column" style={{"textAlign": "left", "inlineSize": "40%"}}>
                                <Form.Group className="mb-3" controlId="formCanadianStatus">
                                    <Form.Label>Select current Canadian Status</Form.Label>
                                    <Form.Select aria-label="Please select your immigration status in Canada." style={{ "backgroundColor": "#F8FBFF" }}>
                                        <option value="canadianborn">Born in Canada</option>
                                        <option value="nonimmigrant">Non-immigrant</option>
                                        <option value="recentimmigrant">Recent immigrant</option>
                                        <option value="establishedimmigrant">Established immigrant</option>
                                        <option value="nonpermanentresident">Non-permanent resident</option>
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formProvince">
                                    <Form.Label>Intended Province in Canada</Form.Label>
                                    <Form.Select style={{ "backgroundColor": "#F8FBFF" }}>
                                        {acceptedProvinces.map((object) =>
                                            <option value={object.replace(/\s/g, '').toLowerCase()}>{object}</option>
                                        )}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formPermitExpiry">
                                    <Form.Label>Permit Expiry Date</Form.Label>
                                    <Form.Control type="date" style={{ "backgroundColor": "#F8FBFF" }}/>
                                </Form.Group>
                    </div>
                    <div className="column" style={{ "textAlign": "left", "inlineSize": "40%" }}>
                                <Form.Group className="mb-3" controlId="formLastName">
                                    <Form.Label>Country of Origin</Form.Label>
                                    <Form.Select style={{ "backgroundColor": "#F8FBFF" }}>
                                    {acceptedCountries.map((object) =>
                                        <option value={object.replace(/\s/g, '').toLowerCase()}>{object}</option>
                                    )}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formPermitExpiry">
                                    <Form.Label>Expected Arrival (leave empty if in Canada.)</Form.Label>
                                    <Form.Control type="date" style={{ "backgroundColor": "#F8FBFF" }}/>
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formLanguageTest">
                                    <Form.Label>Language Tests Taken</Form.Label>
                                    <Form.Select style={{ "backgroundColor": "#F8FBFF" }}>
                                        <option value="0">0</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3plus">3+</option>
                                    </Form.Select>
                                </Form.Group>
                        </div>
                    </div>
                <br/>
                <br />
                <Form.Check type='checkbox' label="Remember me?" style={{"display": "flex",  'paddingLeft': "80px"}} />
                <Form.Check type='checkbox' label="I agree the terms and conditions" style={{"display": "flex",  'paddingLeft': "80px"}} />
                <section style={{'paddingLeft': "50px",}}>
                    <Button variant="danger" type="submit" style={{"--bs-btn-bg": "#830C10", "display": "block", "width": "42%"}} onClick={handleRegister}>
                        Create account
                    </Button>
                </section>
            </Form>
        </>
    )
}

export default ImmigrationDetails