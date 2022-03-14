<?php
 
//require 'vendor/autoload.php' ;
 
class db {
    private $user = "9niepokoj" ;
    private $pass = "";
    private $host = "172.20.44.25";
    private $base = "9niepokoj";
    private $coll = "student";
    private $conn;
    private $dbase;
    private $collection;
    private $coll_account = "account";
    private $account_collection;
    private $coll_session = "session";
    private $session_collection;
    private $coll_data = "data";
    private $data_collection;
 
 
 
    function __construct() {
      $this->conn = new MongoDB\Client("mongodb://{$this->user}:{$this->pass}@{$this->host}/{$this->base}");    
      $this->collection = $this->conn->{$this->base}->{$this->coll};
      $this->account_collection = $this->conn->{$this->base}->{$this->coll_account};
      $this->session_collection = $this->conn->{$this->base}->{$this->coll_session};
      $this->data_collection = $this->conn->{$this->base}->{$this->coll_data};
    }


    function register($user)
    {
      $cursor =  $this->account_collection->find(array('username' => $user['username']));
      if(count($cursor->toArray()) == 0)
        $ret = $this->account_collection->insertOne($user);
      else
        $ret = false;
      return $ret;
    }


    function login($user)
    {
      $cursor =  $this->account_collection->find(array('username' => $user['username'], 'password' => $user['password']));
      if(count($cursor->toArray()) == 1)
        $ret = true;
      else
        $ret = false;
      return $ret;
    }

    function start_session($session)
    {
      $cursor =  $this->session_collection->find(array('token' => $session['token']));
      if(count($cursor->toArray()) == 0)
        $ret = $this->session_collection->insertOne($session);
      else
        $ret = false;
      return true;
    }

    function logout($token)
    {
      $cursor =  $this->session_collection->find(array('token' => $token));
      if(count($cursor->toArray()) != 0)
        $ret = $this->session_collection->deleteOne(array('token' => $token));
      else
        $ret = false;
      return $ret;
    }


    function get_data()
    {
      $cursor = $this->data_collection->find();
      $table = iterator_to_array($cursor);
      return $table ;
    }


    function check_session($token)
    {
      $cursor =  $this->session_collection->find(array('token' => $token));
      $dataArray = $cursor->toArray();
      if(count($dataArray) != 0)
      {
        $session_time = $dataArray[0]['expire_date'];

        $json_data = json_decode($dataArray);
        $current_time = time();
        if($current_time > $session_time)
        {
          $this->session_collection->deleteOne(array('token' => $token));
          return false;
        }
        else
          return true;
      }
      return false;
    }


    function send_data($data)
    {
      $ret = $this->data_collection->insertOne($data);
      return $ret;
    }
}