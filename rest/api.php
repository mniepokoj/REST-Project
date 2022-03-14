<?php
         
require '../vendor/autoload.php' ;        
require_once("rest.php");
require_once("mongo.php");
     
class API extends REST {
     
    public $data = "";
     
    public function __construct(){
        parent::__construct();      // Init parent contructor
              $this->db = new db() ;             // Initiate Database
    }
             
    public function processApi(){
 
        $func = "_".$this->_endpoint ; 
        if((int)method_exists($this,$func) > 0) {
            $this->$func();
              }  else {
            $this->response('Page not found',404); }         
    }
         

    private function _register()
    {
        if($this->get_request_method() != "POST") {
            $this->response('',406);
        }
 
        if(!empty($this->_request) ){
            try {
                   $json_array = json_decode($this->_request,true);
                   $res = $this->db->register($json_array);
                   if ( $res ) {
                   $result = array('return'=>'ok');
                   $this->response($this->json($result), 200);
                     } else {
                        $result = array('return'=>'error');
                        $this->response($this->json($result), 200);
                     }
            } catch (Exception $e) {
                $this->response('', 400) ;
            }
        } else {
            $error = array('status' => "Failed", "msg" => "Invalid send data");
            $this->response($this->json($error), 400);
        }
    }


    private function _login()
    {
        if($this->get_request_method() != "POST") 
        {
            $this->response('',406);
        }
 
        if(!empty($this->_request) )
        {
            try 
            {
                $json_array = json_decode($this->_request,true);
                $res = $this->db->login($json_array);
                if ( $res ) 
                {
                    $token = openssl_random_pseudo_bytes(8);
                    $token = bin2hex($token);
                    $result = array('return'=>'ok', 'token'=> $token);

                    //30 min
                    $expire_date = time() +  (30 * 60);
                    $session = array("expire_date" => $expire_date, "token"=>$token);

                    for($i = 1; $i < 4; $i++)
                    {
                        $rs = $this->db->start_session($session);
                        if($rs)
                            break;
                    }
                    if(rs)
                    {
                        $result = array('return'=>'ok', 'token'=> $token, 'expire_time' => $expire_date);
                        $this->response($this->json($result), 200);
                    }
                    else
                    {
                        $result = array('return'=>'error');
                        $this->response($this->json($result), 200);
                    }  
                } 
                else 
                {
                    $result = array('return'=>'error');
                    $this->response($this->json($result), 200);
                }
            } 
            catch (Exception $e) 
            {
                $this->response('', 400) ;
            }
        } else {
            $error = array('status' => "Failed", "msg" => "Invalid send data");
            $this->response($this->json($error), 400);
        }
    }

    private function _logout()
    {
        if( !($this->get_request_method() == "DELETE" || $this->get_request_method() == "GET")) 
        {
            $this->response('',406);
        }

        if(!empty($this->_request) )
        {
            try 
            {

                    $token = $this->_args[0];

                    $res = $this->db->logout($token);
                    if ( $res ) 
                    {
                        $result = array('return'=>'ok');
                        $this->response($this->json($result), 200);
                        
                    } else 
                    {
                        $result = array('return'=>'not found');
                        $this->response($this->json($result), 200);
                    }
            } 
            catch (Exception $e) 
            {
                $this->response('', 400) ;
            }
        } 
        else 
        {
            $error = array('status' => "Failed", "msg" => "Invalid send data");
            $this->response($this->json($error), 400);
        }
    }

    private function _get_data()
    {
        if($this->get_request_method() != "POST")
        {
            $this->response('',406);
        }
        $json_array = json_decode($this->_request,true);
        $res = $this->db->check_session($json_array['token']);
        if ( $res ) 
        {
            $result = $this->db->get_data();
            $result['return'] = 'ok';        
            $this->response($this->json($result), 200); 
        } 
        else 
        {
            $result = array('return'=>'session expired');
            $this->response($this->json($result), 200);
        }
    }


    private function _send_data()
    {
        if($this->get_request_method() != "POST")
        {
            $this->response('',406);
        }

        if(!empty($this->_request) )
        {
            try 
            {
                $json_array = json_decode($this->_request,true);
                $res = $this->db->check_session($json_array['token']);

                if ( $res ) 
                {
                    unset($json_array["token"]);
                    $res = $this->db->send_data($json_array);
                    if($res )
                    {
                        $result = array('return'=>'ok');
                        $this->response($this->json($result), 200);
                    }
                    else
                    {
                        $result = array('return'=>'error');
                        $this->response($this->json($result), 200);
                    }
                } 
                else 
                {
                    $result = array('return'=>'session expired');
                    $this->response($this->json($result), 200);
                }
            } 
            catch (Exception $e) 
            {
                $this->response('', 400) ;
            }
        } 
        else 
        {
            $error = array('status' => "Failed", "msg" => "Invalid send data");
            $this->response($this->json($error), 400);
        }
    }

 
    private function json($data){
        if(is_array($data)){
            return json_encode($data);
        }
    }
}
         
    $api = new API;
    $api->processApi();
 
?>