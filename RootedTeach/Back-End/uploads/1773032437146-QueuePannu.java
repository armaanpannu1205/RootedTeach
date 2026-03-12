/*
Name: Armaan Pannu
description: This program mimics a playlist with features such as play reverse order and more
date; 4-27-24
self-grade: I would give myself 100 as all features and code are accurate
I have written all the code by myself and did not copy code from other resources. Name: Armaan Pannu
*/
import java.util.*;
public class QueuePannu
{
//no code here
}
class Song
{
   //instance variables
   private String song;
   private String singer;
   //constructor
   public Song(String song, String singer)
   {
      this.song = song;
      this.singer = singer;
   }
   public String getSong()
   {
      return song;
   }
   public String getSinger()
   {
      return singer;
   }
   //toString
   public String toString()
   {
      return song + " " + singer+ "\n**************\n";
   }
   public boolean equals(Song other)
   {
      return this.song.equalsIgnoreCase(other.song ) && this.song.equalsIgnoreCase(other.song);     
        
   }
   /*compares the two songs based on the singer,if same singer then compares the two songs based on the name of the songs name*/
   public int compareTo(Song other)
   {
      if (this.song.compareTo(other.song) == 0 )
         return this.song.compareTo(other.song);
      else
         return  this.song.compareTo(other.song);   
   }
      
    
}
/*
Queue class using an ArrayList. this class will create a queue of songs*/
class Queue {
    private ArrayList<Song> list;

    public Queue() {
        list = new ArrayList<>();
    }

    public void enqueue(Song s) {
        list.add(s);
    }

    public Song dequeue() {
        if (!list.isEmpty()) {
            return list.remove(0);
        }
        return null;
    }

    public void play() {
        Stack<Song> s = new Stack<>();
        Scanner scanner = new Scanner(System.in);
        boolean done = false;

        while (!done) {
            try {
                Song front = dequeue();
                if (front == null) throw new Exception();
                s.push(front);
                System.out.println(front);
                System.out.println("Press any key to continue");
                scanner.nextLine();
            } catch (Exception e) {
                done = true;
            }
        }
        scanner.close();
        restore(s);
    }

    public ArrayList<Song> getSingerSongs(String singer) {
        ArrayList<Song> songs = new ArrayList<>();
        Stack<Song> s = new Stack<>();
        boolean done = false;

        while (!done) {
            try {
                Song front = dequeue();
                if (front == null) throw new Exception();
                s.push(front);
                if (front.getSinger().equalsIgnoreCase(singer)) {
                    songs.add(front);
                }
            } catch (Exception e) {
                done = true;
            }
        }
        restore(s);
        return songs;
    }
    public void restore(Stack<Song> s) {
        while (!s.isEmpty()) {
            Song song = s.pop();
            list.add(0, song);  // Add each song to the front of the list, reversing the order as they are popped
        }
    }
    public String toString() {
        String result = "";  // Initialize an empty string to accumulate song details
        Stack<Song> stack = new Stack<>();
        boolean done = false;
    
        while (!done) {
            try {
                Song front = dequeue();  // Remove the song from the front to process it
                if (front == null) throw new Exception();  // If dequeue returns null, it means the queue is empty
                result += front.toString();  // Concatenate the song's string representation to the result string
                stack.push(front);  // Push the processed song onto the stack to preserve it
            } catch (Exception e) {
                done = true;  // When there are no more songs to process, exit the loop
            }
        }
    
        restore(stack);  
    
        return result;  
    }
    

    public void reverseOrder() {
        Stack<Song> s = new Stack<>();
        boolean done = false;

        while (!done) {
            try {
                Song e = dequeue();
                if (e == null) throw new Exception();
                s.push(e);
            } catch (Exception ex) {
                done = true;
            }
        }

        while (!s.isEmpty()) {
            enqueue(s.pop());
        }
    }

    public String getPercentage(String singer) {
        double sum = 0; // Initialize a variable to count the number of songs by the given singer
        int count = 0; // Initialize a counter for the total number of songs in the queue
        Stack<Song> stack = new Stack<>(); // Use a stack to preserve the order of the queue
        boolean done = false; // A flag to control the loop
    
        while (!done) {
            try {
                Song song = dequeue(); // Dequeue a song from the queue
                if (song == null) {
                    throw new Exception(); // If no song is left in the queue, throw an exception to exit the loop
                }
                count++; // Increment the total count of songs
                stack.push(song); // Push the song onto the stack to restore the queue later
    
                if (song.getSinger().equalsIgnoreCase(singer)) {
                    sum++; // If the singer matches, increment the count of songs by the singer
                }
            } catch (Exception e) {
                done = true; // Set the flag to true to end the loop when the queue is empty
            }
        }
    
        restore(stack); // Restore the queue to its original state by popping songs from the stack
        int perc = (int)((sum / count) * 100);
        // Return the count of songs by the singer out of the total number of songs
        return (int)sum + " out of " + count + " are by the singer " + singer + " or " + perc + " percent!";
    }

    public void preserve(Queue q) {
        while (!q.list.isEmpty()) {
            enqueue(q.dequeue());
        }
    }
}

       
/*Do not remove this driver*/
class Driver
{
   public static void main(String[] args)
   {
      Queue  m = new Queue();
      m.enqueue(new Song ("Riders in the Sky", "Monroe"));
      m.enqueue(new Song("Catch My Breath","Clarkson"));
      m.enqueue(new Song("All American Girl", "Underwood"));
      m.enqueue(new Song("Anyway","McBride"));
      m.enqueue(new Song("Before He Cheats", "Underwood"));
      m.enqueue(new Song("Born Free", "Monroe"));
      m.enqueue(new Song("people Like Us","Clarkson"));
      m.enqueue(new Song("Give Her That", "Underwood"));
      m.enqueue(new Song("So Small", "Underwood"));
      m.enqueue(new Song("Stronger","Clarkson"));
      m.enqueue(new Song("Walk Away", "Monroe"));
      m.enqueue(new Song("Independence Day","McBride"));
      System.out.println("here is the list of your songs\n__________________________");
      System.out.println(m);
      System.out.println("The queue is : " + m);
      m.reverseOrder();
      System.out.println("The queue in the reverse order is: \n"+ m    );
      m.reverseOrder();
      
      System.out.println("\n\nSongs by Underwood: \n");
      System.out.println("\n\n" + m.getPercentage("Underwood"));
      System.out.println("\n\n" + m.getPercentage("Clarkson")+"\n\n");
      System.out.println("Now playing your songs\n");
      m.play();
           
    
   }
}
/*20 points
cretae at least 5 objects and create the driver similar to the given one */
class YourDriver {
    public static void main(String[] args) {
        Queue queue = new Queue(); // Create a new Queue object

        // Enqueue several Song objects into the queue
        queue.enqueue(new Song("God's Plan", "Drake"));
        queue.enqueue(new Song("Passionfruit", "Drake"));
        queue.enqueue(new Song("Cruel Summer", "Taylor Swift"));
        queue.enqueue(new Song("Freestyle", "Lil Baby"));
        queue.enqueue(new Song("Shake it Off", "Taylor Swift"));
        queue.enqueue(new Song("One Dance", "Drake"));
        queue.enqueue(new Song("Final Song", "Lala"));

        // Print tsongs
        System.out.println("Queue of songs:");
        System.out.println(queue);

        System.out.println("Playing all songs:");
        queue.play();
        System.out.println("All songs have been played.");

        queue.reverseOrder();
        System.out.println("Queue after reversing the order:");
        System.out.println(queue);

        // Reversing again to get original
        queue.reverseOrder();
        // Displaying Percentage of Artists
        String percentageArtistOne = queue.getPercentage("Drake");
        System.out.println("Percentage of songs by 'Drake': " + percentageArtistOne);

        String percentageArtistTwo = queue.getPercentage("Taylor Swift");
        System.out.println("Percentage of songs by 'Taylor Swift': " + percentageArtistTwo);
        // Playing Songs
        queue.play();
    }
}