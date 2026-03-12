/*
Name: Armaan Pannu
Description: This program replicates a "Hot Dog Stand". It states various things such as 
ID Number, Owner, Adress, Income, and Hot Dogs sold. It also implements multiple methods such as order
and toString
date: 2-16-23
self-grade: I would give myself 100 as all requirements were met
Testimony: All the code is written by myself and I have not copied the code from any resources. Name: Armaan */

/* THe description for each method is given. You need to implement them based on the given requirments.
Sample output of MyDriver give below. Must run your code with the given MyDriver to get this output to verify the correctness of your code
Then implement YourDriver with the required code in it

ID#: 9123144
Owner: Jose
Address: Folsom
Hot dog sold: 100
Income: 200.0
_______________________________________________
ID#: 96973045
Owner: Jose
Address: Rocklin
Hot dog sold: 150
Income: 300.0
_______________________________________________
ID#: 81285007
Owner: Jose
Address: Folsom
Hot dog sold: 175
Income: 350.0
________________________________________________
Total hotdogs sold at all the stations: 425
________________________________________________
Total income: 850.0




*/


import java.util.Random;

public class HotDogStandPannu {
// No code here
}

class HotDogStand {
   // Instance variables
    private int id;
    private String owner;
    private String address;
    private int countSold;
    public static int price = 10;
    public static int soldPrice = 12;
    // Constructor
    public HotDogStand(int id, String owner, String address) {
        this.id = id;
        this.owner = owner;
        this.address = address;
        this.countSold = 0;
    }
// Getter methods
    public int getId() {
        return id;
    }

    public String getOwner() {
        return owner;
    }

    public String getAddress() {
        return address;
    }

    public int getCountSold() {
        return countSold;
    }
   //Setter methods
    public void setAddress(String newAddress) {
        this.address = newAddress;
    }

    public void setOwner(String newOwner) {
        this.owner = newOwner;
    }

    public void order(int count) {
        countSold += count;
    }

    public double income() {
        return (soldPrice - price) * countSold;
    }

    public String toString() {
        String result = "Station#: " + id + "\n";
        result += "Owner: " + owner + "\n";
        result += "Address: " + address + "\n";
        result += "Hot dog sold: " + countSold + "\n";
        result += "Income: " + income() + "\n";
        return result;
    }
}

class YourDriver {
    public static void main(String[] args) {
        Random rand = new Random();

        int n1, n2, n3;

        // Generate three unique random numbers for the stand IDs
        n1 = getRandNum(rand, 99999, 9999999);
        n2 = getRandNum(rand, 99999, 9999999);
        while (n2 == n1) {
            n2 = getRandNum(rand, 99999, 9999999);
        }
        n3 = getRandNum(rand, 99999, 9999999);
        while (n3 == n1 || n3 == n2) {
            n3 = getRandNum(rand, 99999, 9999999);
        }

        // Declare and instantiate three HotDogStand objects
        HotDogStand stand1 = new HotDogStand(n1, "Armaan Pannu", "Roseville");
        HotDogStand stand2 = new HotDogStand(n2, "Chris Jones", "Rocklin");
        HotDogStand stand3 = new HotDogStand(n3, "Myles Murphy", "Folsom");

        // Generate three random numbers for the hotdogs sold at each stand
        int c1 = getRandNum(rand, 200, 500);
        int c2 = getRandNum(rand, 200, 500);
        int c3 = getRandNum(rand, 200, 500);

        // Call the order method on each HotDogStand object
        stand1.order(c1);
        stand2.order(c2);
        stand3.order(c3);

        // Get the total number of hotdogs sold at all stands
        int t1 = stand1.getCountSold();
        int t2 = stand2.getCountSold();
        int t3 = stand3.getCountSold();
        int total = t1 + t2 + t3;

        // Get the total income
        double income1 = stand1.income();
        double income2 = stand2.income();
        double income3 = stand3.income();
        double totalIncome = income1 + income2 + income3;

        // Displaying the info
        System.out.println(stand1);
        System.out.println("_______________________________________________");
        System.out.println(stand2);
        System.out.println("_______________________________________________");
        System.out.println(stand3);
        System.out.println("________________________________________________");
        System.out.println("Total hotdogs sold at all the stations: " + total);
        System.out.println("________________________________________________");
        System.out.println("Total income: " + totalIncome);
    }

    public static int getRandNum(Random rand, int min, int max) {
        return rand.nextInt(max - min + 1) + min;
    }
}
/*This driver helps you on how to call the non-static methods from the HotDogStand class
Once you have implemented your HotDogStand class, uncommnet MyDriver class and run your code. Your output must match the given output*/

//DO NOT DELETE THIS CLASS hust uncommnet the class to test your code 

class MyDriver
{
    public static void main(String[] args)
    {
    Random rand = new Random();
    //creating three objects
       HotDogStand stand1 = new HotDogStand(rand.nextInt(9999999)+99999, "Jose", "Folsom");
       HotDogStand stand2 = new HotDogStand(rand.nextInt(99999999)+99999, "Jose", "Rocklin");
       HotDogStand stand3 = new HotDogStand(rand.nextInt(99999999)+99999, "Jose", "Folsom");
       
      //ordering hot dogs at different stand
       stand1.order(100);
       stand2.order(150);
       stand3.order(175);
       
       //claculating the income form the stations
       double stand1Income = stand1.income();
       double stand2Income = stand2.income();
       double stand3Income = stand3.income();
       
       //getting the total number of the hotdogs orderd at all the stations
       int total = stand1.getCountSold() + stand2.getCountSold()+ stand3.getCountSold() ;
       double totalIncome = stand1.income() + stand2.income() + stand3.income();
       
       //displaying the info
       System.out.println(stand1);
       System.out.println("_______________________________________________");
       System.out.println(stand2);
       System.out.println("_______________________________________________");
       System.out.println(stand3);
       System.out.println("________________________________________________");
       System.out.println("Total hotdogs sold at all the stations: " + total);
       System.out.println("________________________________________________");
       System.out.println("Total income: " + totalIncome);
       
       

       
       
    }
}
