class WelcomeController < ApplicationController

    def index
        @data = CrimeEntry.getCrimeResults()
    end

end
