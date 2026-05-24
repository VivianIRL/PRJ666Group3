import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { Link } from 'react-router-dom';

function Login() {
    return (
    <div style={{ "text-align": "center" }} >
        <div style={{"display": "inline-block", "text-align": "left", 'margin-top': "120px", "inline-size": "40%"}}>
            <h2><b>Welcome back</b></h2>
            <div style={{"font-size": "12.5px"}}>
                Get back to your task list!
                <br />
                <br />
                <Form>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label><b>Email address</b></Form.Label>
                            <Form.Control type="email" placeholder="Example@email.com" style={{"background": "#F8FBFF"}}/>
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="formBasicPassword">
                        <Form.Label><b>Password</b></Form.Label>
                        <Form.Control type="password" placeholder="At least 8 characters" style={{"background": "#F8FBFF"}}/>
                        <Form.Text style={{"text-align": "right"}}>
                            <Link to="/">Forgot password?</Link>
                        </Form.Text>
                    </Form.Group>
                    <Button variant="danger" type="submit" style={{"--bs-btn-bg": "#830C10", "display": "block", "width": "100%"}}>
                        Log in
                    </Button>
                </Form>
            </div>
        </div>
    </div>
  )
}

export default Login
